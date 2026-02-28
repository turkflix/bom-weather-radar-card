import { css, CSSResultGroup } from 'lit';

/**
 * Styles for radar image container and loading states
 */
export const imageStyles: CSSResultGroup = css`
  /* Radar Image Container - Auto size to image */
  .radar-image-container {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
    display: block;
    line-height: 0; /* Removes extra space below image */
  }

  .radar-image {
    width: 100%;
    height: auto;
    display: block;
    image-rendering: crisp-edges;
    transition: transform 0.3s ease;
    max-width: 100%;
  }

  .radar-image-contain {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .radar-image-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .radar-image-fill {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  .loading {
    text-align: center;
    color: white;
    font-size: 1.2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;
    background: #1a1a1a;
    border-radius: 8px;
  }

  .loading-icon {
    width: 80px;
    height: 80px;
    animation: pulse 2s ease-in-out infinite;
    opacity: 0.8;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  .loading-message {
    font-size: 0.9em;
    opacity: 0.9;
  }
`;

