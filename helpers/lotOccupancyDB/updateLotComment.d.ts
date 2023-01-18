import type * as recordTypes from '../../types/recordTypes';
interface UpdateLotCommentForm {
    lotCommentId: string | number;
    lotCommentDateString: string;
    lotCommentTimeString: string;
    lotComment: string;
}
export declare function updateLotComment(commentForm: UpdateLotCommentForm, requestSession: recordTypes.PartialSession): Promise<boolean>;
export default updateLotComment;
