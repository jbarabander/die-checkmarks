const checkmarkBadgeClass = '.ytd-author-comment-badge-renderer';
const commentSectionClass = '.ytd-item-section-renderer';

(function() {

    function checkIfShill(contentText) {
        return contentText.startsWith('https://www.youtube.com');
    }
    function checkComment(content) {
        const commentRenderer = content?.commentThreadRenderer?.comment?.commentRenderer;
        return commentRenderer?.authorIsChannelOwner 
        || (commentRenderer?.authorCommentBadge?.authorCommentBadgeRenderer?.iconTooltip !== "Verified" && (commentRenderer?.contentText?.runs || []).map(({ text }) => text).every((text) => !checkIfShill(text)))
    }
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (url.includes('/comment_service_ajax?action_get_comments')) {
            this.addEventListener('readystatechange', function(event) {
                if ( this.readyState === 4 ) {
                   const parsedResponse = JSON.parse(event.target.responseText);
                   if(parsedResponse.response?.continuationContents?.itemSectionContinuation?.contents) {
                        const onlyNonVerifiedOrAuthor = parsedResponse.response.continuationContents.itemSectionContinuation.contents.filter(checkComment);

                        parsedResponse.response.continuationContents.itemSectionContinuation.contents = onlyNonVerifiedOrAuthor;
                        Object.defineProperty(this, 'response',     {writable: true});
                        Object.defineProperty(this, 'responseText', {writable: true});
                        this.response = this.responseText = JSON.stringify(parsedResponse);
                    }
                }
             });
        } else if (url.includes('/comment_service_ajax?action_get_comment_replies')) {
            this.addEventListener('readystatechange', function(event) {
                if ( this.readyState === 4 ) {
                    const text = event.target.responseText;
                   const parsedResponse = JSON.parse(event.target.response);
                   if(parsedResponse?.[1]?.response?.continuationContents?.commentRepliesContinuation?.contents) {
                        JSON.stringify(parsedResponse?.[1]?.response?.continuationContents?.commentRepliesContinuation?.contents);
                        const onlyVerifiedComments = parsedResponse?.[1]?.response?.continuationContents?.commentRepliesContinuation?.contents.filter(checkComment);
                        console.log(onlyVerifiedComments);
                        // console.log(text.includes(parsedResponse?.[1]?.response?.continuationContents?.commentRepliesContinuation?.contents));
                        // const onlyNonVerifiedOrAuthor = parsedResponse?.[1]?.response?.continuationContents?.commentRepliesContinuation?.contents.filter(checkComment);
                        // parsedResponse[1].response.continuationContents.commentRepliesContinuation.contents = onlyNonVerifiedOrAuthor;
                        // Object.defineProperty(this, 'response',     {writable: true});
                        // Object.defineProperty(this, 'responseText', {writable: true});
                        // console.log(text, JSON.stringify(parsedResponse));
                        // this.response = JSON.stringify(parsedResponse);
                        // this.responseText = JSON.stringify(parsedResponse);
                    }
                }
             });
        }
        originalOpen.call(this, method, url, ...rest);
    }
})();