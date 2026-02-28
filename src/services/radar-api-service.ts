import { RadarResponse, RadarTimeSeriesResponse, RadarFrame, ErrorState } from '../types';
import { parseApiError, parseErrorResponse } from '../utils/error-handler';
import { resolveImageUrl } from '../utils/url-resolver';

export interface FetchRadarOptions {
  serviceUrl: string;
  suburb: string;
  state: string;
  timespan?: string;
  customStartTime?: string;
  customEndTime?: string;
  onError: (error: ErrorState) => void;
}

export class RadarApiService {
  /**
   * Fetches latest radar frames via direct HTTP request
   */
  async fetchLatestFrames(options: FetchRadarOptions): Promise<RadarResponse | null> {
    const { serviceUrl, suburb, state, onError } = options;
    
    try {
      const url = `${serviceUrl}/api/radar/${encodeURIComponent(suburb.toLowerCase())}/${encodeURIComponent(state.toLowerCase())}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle service-level errors (e.g. CACHE_NOT_FOUND)
      if (data.errorCode || data.ErrorCode || data.error) {
        const error = parseApiError(
          response,
          data,
          true,
          {
            retryAction: () => this.fetchLatestFrames(options),
            defaultRetryAfter: 30,
          }
        );
        onError(error);
        return null;
      }

      // Validate response has frames
      if (!data.frames || data.frames.length === 0) {
        throw new Error('No frames available in response');
      }

      // Resolve relative image URLs to absolute URLs
      data.frames.forEach((frame: RadarFrame) => {
        if (frame.imageUrl) {
          frame.imageUrl = this.resolveImageUrl(frame.imageUrl, serviceUrl);
        }
      });

      return data;
    } catch (err: any) {
      this.handleFetchError(err, options);
      return null;
    }
  }

  /**
   * Fetches historical radar data via direct HTTP request
   */
  async fetchHistoricalFrames(options: FetchRadarOptions): Promise<RadarResponse | null> {
    const { serviceUrl, suburb, state, timespan, customStartTime, customEndTime, onError } = options;
    
    try {
      let url = `${serviceUrl}/api/radar/${encodeURIComponent(suburb.toLowerCase())}/${encodeURIComponent(state.toLowerCase())}/timeseries`;
      const params = new URLSearchParams();

      if (timespan === 'custom') {
        if (customStartTime) params.append('startTime', new Date(customStartTime).toISOString());
        if (customEndTime) params.append('endTime', new Date(customEndTime).toISOString());
      } else if (timespan) {
        const hours = parseInt(timespan.replace('h', '')) || 1;
        const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000)).toISOString();
        params.append('startTime', startTime);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle service-level errors (e.g. TIME_RANGE_ERROR or CACHE_NOT_FOUND)
      if (data.errorCode || data.ErrorCode || data.error) {
        const error = parseApiError(
          response,
          data,
          true,
          {
            retryAction: () => this.fetchHistoricalFrames(options),
            defaultRetryAfter: 30,
          }
        );
        onError(error);
        return null;
      }

      if (!data.cacheFolders || data.cacheFolders.length === 0) {
        throw new Error('No historical data found for the specified time range.');
      }

      // Flatten all frames from all cache folders
      const allFrames: RadarFrame[] = [];
      data.cacheFolders.forEach(cacheFolder => {
        cacheFolder.frames.forEach(frame => {
          frame.cacheTimestamp = cacheFolder.cacheTimestamp;
          frame.observationTime = cacheFolder.observationTime;
          frame.cacheFolderName = cacheFolder.cacheFolderName;
          
          if (frame.imageUrl) {
            frame.imageUrl = this.resolveImageUrl(frame.imageUrl, serviceUrl);
          }
          
          if (!frame.absoluteObservationTime && frame.observationTime && frame.minutesAgo !== undefined) {
            const obsTime = new Date(frame.observationTime);
            frame.absoluteObservationTime = new Date(obsTime.getTime() - (frame.minutesAgo * 60 * 1000)).toISOString();
          }
          
          allFrames.push(frame);
        });
      });

      // Re-index frames sequentially
      allFrames.sort((a, b) => new Date(a.absoluteObservationTime!).getTime() - new Date(b.absoluteObservationTime!).getTime());
      allFrames.forEach((frame, idx) => {
        frame.sequentialIndex = idx;
      });

      // Fetch latest metadata for display
      let metadata: Partial<RadarResponse> = {};
      try {
        const metadataUrl = `${serviceUrl}/api/radar/${encodeURIComponent(suburb.toLowerCase())}/${encodeURIComponent(state.toLowerCase())}`;
        const metadataResponse = await fetch(metadataUrl);
        if (metadataResponse.ok) {
          metadata = await metadataResponse.json();
        }
      } catch (err) {
        console.debug('Could not fetch metadata:', err);
      }

      const newestCacheFolder = data.cacheFolders[data.cacheFolders.length - 1];
      const radarResponse: RadarResponse = {
        frames: allFrames,
        lastUpdated: new Date().toISOString(),
        observationTime: metadata.observationTime || newestCacheFolder?.observationTime || new Date().toISOString(),
        forecastTime: metadata.forecastTime || new Date().toISOString(),
        weatherStation: metadata.weatherStation,
        distance: metadata.distance,
        cacheIsValid: metadata.cacheIsValid ?? true,
        cacheExpiresAt: metadata.cacheExpiresAt || new Date().toISOString(),
        isUpdating: metadata.isUpdating || false,
        nextUpdateTime: metadata.nextUpdateTime || new Date().toISOString(),
      };

      return radarResponse;
    } catch (err: any) {
      this.handleFetchError(err, options);
      return null;
    }
  }

  /**
   * Resolve relative image URLs to absolute URLs
   */
  private resolveImageUrl(imageUrl: string, serviceUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl; // Already absolute
    }
    if (imageUrl.startsWith('/')) {
      return serviceUrl + imageUrl; // Absolute path
    }
    return serviceUrl + '/' + imageUrl; // Relative path
  }

  /**
   * Handles fetch errors and categorizes them appropriately
   */
  private handleFetchError(err: any, options: FetchRadarOptions): void {
    const message = err?.message || (typeof err === 'string' ? err : 'Unknown error occurred');
    options.onError({
      message: message,
      type: 'unknown',
      retryable: true,
      retryAction: () => this.fetchLatestFrames(options),
    });
  }
}