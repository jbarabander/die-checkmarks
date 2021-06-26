const checkmarkBadgeClass = '.ytd-author-comment-badge-renderer';
const commentSectionClass = '.ytd-item-section-renderer';
const commentRequest = 'https://www.youtube.com/comment_service_ajax?action_get_comments';
// window.on('DOMContentLoaded', () => {\
(function() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (url.includes('/comment_service_ajax?action_get_comments')) {
            this.addEventListener('readystatechange', function(event) {
                if ( this.readyState === 4 ) {
                   const parsedResponse = JSON.parse(event.target.responseText);
                   if(parsedResponse.response?.continuationContents?.itemSectionContinuation?.contents) {
                    const onlyNonVerifiedOrAuthor = parsedResponse.response.continuationContents.itemSectionContinuation.contents.filter((content) => {
                        const commentRenderer = content?.commentThreadRenderer?.comment?.commentRenderer;
                        return commentRenderer?.authorIsChannelOwner 
                        || commentRenderer?.authorCommentBadge?.authorCommentBadgeRenderer?.iconTooltip !== "Verified";
                    });

                    parsedResponse.response.continuationContents.itemSectionContinuation.contents = onlyNonVerifiedOrAuthor;
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