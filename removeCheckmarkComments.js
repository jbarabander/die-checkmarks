const checkmarkBadgeClass = '.ytd-author-comment-badge-renderer';
const commentSectionClass = '.ytd-item-section-renderer';
const commentRequest = 'https://www.youtube.com/comment_service_ajax?action_get_comments';
// window.on('DOMContentLoaded', () => {\
(function() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        console.log('too late');
        if (url.includes('/comment_service_ajax?action_get_comments')) {
            this.addEventListener('readystatechange', function(event) {
                if ( this.readyState === 4 ) {
                   const parsedResponse = JSON.parse(event.target.responseText);
                   if(parsedResponse.response?.continuationContents?.itemSectionContinuation?.contents) {
                    const onlyNonVerified = parsedResponse.response.continuationContents.itemSectionContinuation.contents.filter((content) => {
                        return content?.commentThreadRenderer?.comment?.commentRenderer?.authorCommentBadge?.authorCommentBadgeRenderer?.iconTooltip !== "Verified";
                    });

                    parsedResponse.response.continuationContents.itemSectionContinuation.contents = onlyNonVerified;
                }
                   Object.defineProperty(this, 'response',     {writable: true});
                   Object.defineProperty(this, 'responseText', {writable: true});
                   this.response = this.responseText = JSON.stringify(parsedResponse);
                }
             });
        }
        originalOpen.call(this, method, url, ...rest);
    }
})();

// });