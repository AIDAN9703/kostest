import React from 'react';

interface BoatCoverProps {
  coverUrl: string;
}

const BoatCover: React.FC<BoatCoverProps> = ({ coverUrl }) => {
  return (
    <div>BoatCover: <img src={coverUrl} alt="Boat Cover" /></div>
  );
};

export default BoatCover;