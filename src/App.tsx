import React, { Fragment, useCallback, useEffect, useState } from "react";
import BarcodeScannerComponent from "react-webcam-barcode-scanner";
import { useWindowSize } from "./resizeHook";
import axios from "axios";

interface BookProps {
  publishers: string[];
  covers: string[]; // `https://covers.openlibrary.org/b/id/${cover}-L.jpg` [SML]
  authors: Array<{ key: string }>; // https://openlibrary.org${key}.json
  languages: Array<{ key: string }>; // '/languages/eng'
  title: string[];
  number_of_pages: number;
  created: { type: string, value: string }; // type '/type/datetime' value '2008-04-30T08:14:56.482104'
  publish_date: string; // 'December 15, 1998'
}

interface AuthorProps {
  name: string;
  personal_name: string;
}

export const App = () => {
  const [book, setBook] = useState<BookProps>();
  const [authors, setAuthors] = useState<AuthorProps[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState("");
  const [width, height] = useWindowSize();
  const [pause, setPause] = useState(false);

  const update = useCallback((err, code) => {
    if (!pause && code && code.text) {
      axios.get<BookProps>(`https://openlibrary.org/isbn/${code.text}.json`)
        .then(result => {
          if (result.data) {
            setBook(result.data);
            if (Array.isArray(result.data.authors)) {
              result.data.authors.forEach(author => 
                axios.get<AuthorProps>(`https://openlibrary.org${author.key}.json`)
                  .then(authorRes => {
                    if (authorRes.data) {
                      setAuthors(auths => [...auths, authorRes.data])
                    }
              }))
            }
            if (Array.isArray(result.data.covers)) {
              result.data.covers.length && setCoverUrl(`https://covers.openlibrary.org/b/id/${result.data.covers[0]}-M.jpg`)
            }
          }
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <button onClick={unPause} disabled={!pause}>UnPause</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          book ? Object.entries(book).map(([key, val]) => <Fragment key={key} >
            <div style={{flexGrow: 1, width: '50%', height: '3rem'}}>{key}</div>
            <div style={{flexGrow: 1, width: '50%', height: '3rem'}} >{
            typeof val === 'string' || typeof val === 'number' ? val : JSON.stringify(val) 
            }</div>
          </Fragment>) : null
        }
        {
          authors ? authors.map(author => <Fragment key={author.name}>
            <div style={{flexGrow: 1, width: '50%', height: '3rem'}}>Author</div>
            <div style={{flexGrow: 1, width: '50%', height: '3rem'}}>{author.personal_name}</div>
          </Fragment>) : null
        }
        {
          coverUrl ? <img src={coverUrl} /> :  null 
        }
      </div>
      <div>
        <span>{error}</span>
      </div>
    </div>
  </>
}
