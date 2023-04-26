import ActionHandler from "./ActionHandler";
import CLP_WORKER_PROTOCOL from "./CLP_WORKER_PROTOCOL";
import MODIFY_FILE_ACTION from "./MODIFY_FILE_ACTION";
import SCANNER_PROTOCOL from "./SCANNER_PROTOCOL";
import XMLParser from "fast-xml-parser/src/xmlparser/XMLParser";

const sendError = (error) => {
    postMessage({
        code: SCANNER_PROTOCOL.ERROR,
        error: error.toString(),
    });
    console.debug(error);
};

function getTimestampFromKey (key) {
    const splitIdx = key.lastIndexOf("_");
    if (-1 === splitIdx) {
        return null;
    }
    const timestampStr = key.slice(splitIdx + 1).split(".")[0];
    const timestamp = parseInt(timestampStr);
    return isNaN(timestamp) ? null : timestamp;
}

function queryNextFile (queryURL, hostname) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        try {
            const fastXMLParser = new XMLParser();
            const xmlParsed = fastXMLParser.parse(xhr.response).ListBucketResult;
            const contents = xmlParsed.Contents;
            const key = contents.Key;
            console.debug(`Path: ${key}`);
            postMessage({
                code: SCANNER_PROTOCOL.LOAD_NEXT,
                fileInfo: `https://${hostname}/${key}`,
            });
        } catch (e) {
            sendError(e);
        }
    };
    xhr.open("GET", queryURL);
    xhr.send();
}

function queryPrevFile (prefix, timestamp, currKey, hostname) {
    let numHours = 1;
    while (numHours <= 24) {
        const queryTimestamp = timestamp - (numHours) * 60 * 1000;
        const marker = `${prefix}${queryTimestamp}.clp.zst`;
        const prevFileQueryUrl = `https://${hostname}/?prefix=${prefix}&marker=${marker}&max-keys=1000`;
        console.debug(`Query: ${prevFileQueryUrl}`);
        const xhr = new XMLHttpRequest();
        xhr.open("GET", prevFileQueryUrl, false);
        try {
            xhr.send();
        } catch (e) {
            sendError(e);
            break;
        }
        if (4 !== xhr.readyState && 200 !== xhr.status) {
            ++numHours;
            continue;
        }
        try {
            const fastXMLParser = new XMLParser();
            const xmlParsed = fastXMLParser.parse(xhr.response).ListBucketResult;
            const contents = xmlParsed.Contents;
            let prevKey = null;
            let found = false;
            for (let i = 0; i < contents.length; ++i) {
                const key = contents[i].Key;
                if (key === currKey) {
                    found = true;
                    break;
                }
                prevKey = key;
            }
            if (null === prevKey || false === found) {
                ++numHours;
                continue;
            }
            console.debug(`Previous Key: ${prevKey}`);
            postMessage({
                code: SCANNER_PROTOCOL.LOAD_PREV,
                fileInfo: `https://${hostname}/${prevKey}`,
            });
            break;
        } catch (e) {
            sendError(e);
            break;
        }
    }
}

onmessage = function (e) {
    switch (e.data.code) {
        case SCANNER_PROTOCOL.SCAN:
            const currFile = e.data.fileInfo;
            console.debug(`Current: ${currFile}`);
            let url;
            try {
                url = new URL(currFile);
            } catch (e) {
                console.debug("This is a local file.");
                break;
            }
            const hostnameElements = url.hostname.split(".");
            if (hostnameElements.length !== 5 || hostnameElements[1] !== "s3") {
                console.debug("The given file is not from s3.");
                break;
            }
            const bucket = url.hostname.split(".")[0];
            const prefixSplitIdx = url.pathname.lastIndexOf("_");
            if (-1 === prefixSplitIdx) {
                console.debug("The file doesn't fit into timestamp format.");
                break;
            }
            const prefix = url.pathname.slice(0, prefixSplitIdx + 1).slice(1);
            const timestampStr = url.pathname.slice(prefixSplitIdx + 1).split(".")[0];
            const timestamp = parseInt(timestampStr);
            if (isNaN(timestamp)) {
                console.debug(`Timestamp field is not a number: ${timestampStr}`);
                break;
            }
            console.debug(`Bucket: ${bucket}; Prefix: ${prefix}; Timestamp: ${timestampStr}`);
            const nextFileQueryUrl = `https://${url.hostname}/?prefix=${prefix}&marker=${url.pathname.slice(1)}&max-keys=1`;
            queryNextFile(nextFileQueryUrl, url.hostname);
            queryPrevFile(prefix, timestamp, url.pathname.slice(1), url.hostname);
            break;
        default:
            break;
    }
};

onerror = (e) => {
    console.debug(e);
};
