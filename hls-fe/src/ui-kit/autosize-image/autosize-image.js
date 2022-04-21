import React, { useEffect, useState } from 'react';
import { node, number, shape, string } from 'prop-types';
import { STANDARD_RATIO } from '../../util/constants';


function AutosizeImage({ src, alt, ratio, placeholder, ...otherProps }) {
  const [comparesToRatio, setComparesToRatio] = useState(0);

  useEffect(() => {
    setComparesToRatio(0);
    const image = new Image();
    image.onload = () => {
      const { width, height } = image;
      setComparesToRatio(Math.sign(width / height - ratio.w / ratio.h));
    }
    image.src = src;
  }, [src]);

  if (comparesToRatio === 0) {
    return placeholder;
  }

  return (
    <img
      src={src}
      height={comparesToRatio < 0 ? '100%' : 'auto'}
      width={comparesToRatio > 0 ? '100%' : 'auto'}
      alt={alt}
      {...otherProps}
    />
  );
}

AutosizeImage.propTypes = {
  src: string.isRequired,
  alt: string.isRequired,
  ratio: shape({ w: number.isRequired, h: number.isRequired }),
  placeholder: node
};

AutosizeImage.defaultProps = {
  ratio: STANDARD_RATIO,
  placeholder: null
};

export default AutosizeImage;