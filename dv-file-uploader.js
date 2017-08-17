'use strict';

/**
 * A class that can be use to upload any file into dcache.
 * 
 * @class UploadHandler
 */
class UploadHandler
{

    /**
     * Creates an instance of UploadHandler.
     * @constructor
     * @param {object} options Hash of options
     * @param {string} options.authType
     * @param {string} options.credentials Accept both Basic and Bearer. 
     *      If it is Basic; Encoded Base64 of username:password
     * @param {blob} options.file Blob-like item to upload
     * @param {string} [options.contentType] Content-type, if overriding 
     *      the type of the blob.
     * @param {function} [options.onComplete] Callback for when upload 
     *      is complete
     * @param {function} [options.onProgress] Callback for status for 
     *      the in-progress upload
     * @param {function} [options.onError] Callback if upload fails
     *
     *  @example
     *  var content = new Blob(["Hello world"], {"type": "text/plain"});
     *  var uploader = new UploadHandler({
     *      file: content,
     *      authType: 'Basic'
     *      credentials: 'xxxx',
     *      onComplete: function(data) { ... },
     *      onError: function(data) { ... }
     *  })
     *  uploader.upload();
     * @memberof UploadHandler
     */
    constructor(options)
    {
        const noop = function() {};
        this.file = options.file;
        this.contentType = options.contentType || this.file.type ||
            'application/octet-stream';
        this.authType = options.authorizationType;
        this.credentials = options.authorizationCredentials;
        this.onComplete = options.onComplete || noop;
        this.onProgress = options.onProgress || noop;
        this.onError = options.onError || noop;
        this.url = options.url;
        this.httpMethod = 'PUT';
    }

    /**
     * Upload the actual file content.
     * 
     * @memberof UploadHandler
     */
    upload()
    {
        const xhr = new XMLHttpRequest();
        if (xhr.upload) {
            xhr.upload.addEventListener('progress', this.onProgress);
        }
        xhr.addEventListener('load', this._onUploadComplete);
        xhr.addEventListener('error', this._onUploadError);

        xhr.open(this.httpMethod, this.url, true);
        xhr.setRequestHeader('Content-Type', this.contentType);
        xhr.setRequestHeader('Authorization', this.authType
            + ' ' + this.credentials);
        xhr.setRequestHeader('Suppress-WWW-Authenticate', 'Suppress');
        xhr.send(this.file);
    }

    /**
     * Handle successful responses for uploads. If complete, invokes
     * the caller's callback.
     * 
     * @private
     * @param {object} evt XHR event
     * @memberof UploadHandler
     */
    _onUploadComplete(evt)
    {
        if (evt.target.status == 200 || evt.target.status == 201) {
            this.onComplete(this.file);
        } else {
            this._onUploadError(evt);
        }
    }

    /**
     * Handles errors for uploads. [Client Side] error.
     * 
     * @private
     * @param {object} evt XHR event
     * @memberof UploadHandler
     */
    _onUploadError(evt)
    {
        this.onError(evt.target);
    }
}
