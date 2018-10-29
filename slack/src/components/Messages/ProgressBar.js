import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentUploaded }) => (
    uploadState === 'uploading' && (
        <Progress 
            className="progress==bar"
            percent={percentUploaded}
            progress
            inverted
            indicating
            size="medium"
        />
    )
)

export default ProgressBar;