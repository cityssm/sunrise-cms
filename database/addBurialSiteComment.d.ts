export interface AddBurialSiteCommentForm {
    burialSiteId: string;
    comment: string;
}
export default function addBurialSiteComment(commentForm: AddBurialSiteCommentForm, user: User): Promise<number>;
