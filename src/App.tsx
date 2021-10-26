import React, { useCallback, useEffect, useState } from "react";
import BarcodeScannerComponent from "react-webcam-barcode-scanner";
import { useWindowSize } from "./resizeHook";
import axios from "axios";

export const App = () => {
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const [width, height] = useWindowSize();
  const [pause, setPause] = useState(false);

  const update = useCallback((err, code) => {
    if (!pause && code && code.text) {
      axios.get(`https://openlibrary.org/isbn/${code.text}.json`)
        .then(result => {
          setData(JSON.stringify(result));
          setPause(true);
          setError("");
        })
        .catch(e => setError(e.message || e))
    }
    if (!pause && err) {
      if (err.message) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  }, [pause]);

  const unPause = useCallback(() => setPause(false), []);

  return <>
    <BarcodeScannerComponent width={Math.floor(width * .9)} height={Math.floor(width * 0.2)} onUpdate={update} />
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div>
        <button onClick={unPause} disabled={!pause}>UnPause</button>
      </div>
      <div>
        <span>{data}</span>
      </div>
      <div>
        <span>{error}</span>
      </div>
    </div>
  </>
}
