"use client";

import { enqueueSnackbar } from "notistack";
import "react-comments-section/dist/index.css";
import { TUserModel } from "@/models/user/user";
import { Stack, Box, Typography } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { CommentSection } from "react-comments-section";
import { base64ToBlobUrl } from "@/components/account/personal-area/_helpers/image";
import { useUserNewsCommentsStore } from "@/stores/personal-area/news/news-comments";
import { CurrentUserContext } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type CommentType = {
  text: string;
  replies: any;
  comId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  userProfile?: string;
};

type NewsCommentsPropsType = {
  post: Record<string, any> | null;
};

export function CommentBox({ post }: NewsCommentsPropsType) {
  const commentsStore = useUserNewsCommentsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserProfileBlobUrl, setCurrentUserProfileBlobUrl] = useState<any>();

  const changeTextContentOfCommentsSection = () => {
    setTimeout(() => {
      const userLinks = document.querySelectorAll("div .commentsTwo a");
      const submitButtons = document.querySelectorAll("button.postBtn");
      const replyButtons = document.querySelectorAll("button.replyBtn");
      const userCommentImgLink = document.querySelector("div.userImg a");
      const cancelButtons = document.querySelectorAll("button.cancelBtn");
      const modalDiv = document.querySelector("div .react-responsive-modal-modal");
      const textAreaDivs = document.querySelectorAll("div.public-DraftEditorPlaceholder-inner");
      const textEditorContainers = document.querySelectorAll("div.public-DraftStyleDefault-block span");
      const actionButtons = document.querySelectorAll("div .szh-menu-container ul .szh-menu__item");

      if (modalDiv) {
        const description = modalDiv.querySelector("p");
        const headerElement = modalDiv.querySelector("h2");
        const modalActionButtons = modalDiv.querySelectorAll("div > button.delete, div > button.cancel");

        if (headerElement) headerElement.textContent = "Вы уверены?";
        if (description) description.textContent = "Как только вы удалите этот комментарий, он исчезнет навсегда.";
        if (modalActionButtons) {
          modalActionButtons.forEach((btn) => {
            if (btn.textContent == "Delete") btn.textContent = "Удалить";
            if (btn.textContent == "Cancel") btn.textContent = "Отменить";
          });
        }
      }

      if (userCommentImgLink) {
        userCommentImgLink.removeAttribute("href");
        userCommentImgLink.removeAttribute("target");
      }

      if (userLinks.length > 0) {
        userLinks.forEach((link) => {
          link.removeAttribute("href");
          link.removeAttribute("target");
        });
      }

      if (actionButtons.length > 0) {
        actionButtons.forEach((btn) => {
          if (btn.textContent == "edit") btn.remove();
          else {
            const div = btn.querySelector("div > div");
            if (div) div.textContent = "Удалить";
          }
        });
      }

      if (submitButtons.length > 0) {
        submitButtons.forEach((element) => {
          if (`${element.textContent}` !== "Отправить") element.textContent = "Отправить";
        });
      }

      if (replyButtons.length > 0) {
        replyButtons.forEach((btn) => {
          const buttonElement = btn as HTMLElement;

          if (!!buttonElement) {
            buttonElement.style.width = "120px";
            const span = buttonElement.querySelector("span");
            if (span) span.textContent = "Ответить";
          }
        });
      }

      if (cancelButtons.length > 0) {
        cancelButtons.forEach((btn) => {
          const buttonElement = btn as HTMLElement;
          if (`${buttonElement.textContent}` !== "Отменить") buttonElement.textContent = "Отменить";
        });
      }

      if (textAreaDivs.length > 0) {
        textAreaDivs.forEach((div) => {
          if (`${div.textContent}` !== "Оставьте комментарий...") div.textContent = "Оставьте комментарий...";
        });
      }

      if (textEditorContainers.length > 0) {
        textEditorContainers.forEach((div) => {
          const handleMutations = () => {
            changeTextContentOfCommentsSection();
          };
          const observer = new MutationObserver(handleMutations);
          if (div) {
            observer.observe(div, {
              childList: true,
              attributes: true,
              characterData: true,
            });
          }
        });
      }
    }, 10);
  };

  const handleClickEvent = () => {
    changeTextContentOfCommentsSection();
  };

  const preparingRequestBody = (data: Record<string, any>, type: string) => {
    return {
      data: {
        text: data.text,
        ...(type == "comment" ? { publication: { id: post?.id } } : {}),
        relatedUser: { id: data.userId },
      },
    };
  };

  const handleSubmit = (reqBody: Record<string, any>, callBack: (data: Record<string, any>) => void) => {
    commentsStore.createComment(reqBody, callBack);
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (`${currentUserContext?.currentUserProfileImage}`.length > 0) {
      const blobUrl = base64ToBlobUrl(`${currentUserContext?.currentUserProfileImage}`, "image/png");
      setCurrentUserProfileBlobUrl(blobUrl);
    }
  }, [currentUserContext]);

  useEffect(() => {
    let comments: CommentType[] = [];

    if (post?.comments.length > 0) {
      const sortedComments = post?.comments.sort(
        (a: Record<string, any>, b: Record<string, any>) =>
          new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
      );

      sortedComments.map((comment: Record<string, any>) => {
        let replies: Record<string, any>[] = [];

        if (comment.reply.length > 0) {
          const sortedReplies = comment.reply.sort(
            (a: Record<string, any>, b: Record<string, any>) =>
              new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
          );

          sortedReplies.map((replyComment: Record<string, any>) => {
            replies.push({
              comId: `${replyComment?.id}`,
              text: `${replyComment?.text}`,
              userId: `${replyComment?.user?.id}`,
              fullName: `${replyComment?.user?.name}`,
              avatarUrl: `${base64ToBlobUrl(`${replyComment?.user?.image}`, "image/png")}`,
            });
          });
        }

        const commentObject: CommentType = {
          comId: `${comment?.id}`,
          text: `${comment?.text}`,
          userId: `${comment?.user.id}`,
          fullName: `${comment?.user.name}`,
          avatarUrl: `${base64ToBlobUrl(`${comment?.user?.image}`, "image/png")}`,
          replies: replies,
        };

        comments.push(commentObject);
      });

      setComments(comments);
    }
  }, [post]);

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Stack spacing={3} sx={{ flex: "1 1 auto" }}>
        {currentUser && (
          <div onClick={handleClickEvent}>
            <CommentSection
              advancedInput={true}
              commentData={comments}
              formStyle={{ backgroundColor: "white" }}
              inputStyle={{ border: "1px solid rgb(208 208 208)" }}
              replyInputStyle={{ borderBottom: "1px solid black", color: "black" }}
              hrStyle={{ marginBottom: 20, marginTop: 10, borderColor: "#bcbdc2", borderWidth: "1px" }}
              currentData={(data: Record<string, any>[]) => {
                changeTextContentOfCommentsSection();
                const commentTitle = document.querySelector(".comment-title");
                if (commentTitle) {
                  commentTitle.textContent = `${data?.length} ${data.length > 4 ? "Комментариев" : data.length > 1 ? "Комментария" : "Комментарий"}...`;
                }
              }}
              submitBtnStyle={{
                border: "1px solid black",
                backgroundColor: "black",
                padding: "7px 15px",
              }}
              cancelBtnStyle={{
                border: "1px solid gray",
                backgroundColor: "gray",
                color: "white",
                padding: "7px 15px",
              }}
              logIn={{
                loginLink: `${process.env.NEXT_PUBLIC_API_URL}/foms/#/login`,
                signUpLink: "#",
              }}
              customNoComment={() => (
                <Box sx={{ m: 3 }}>
                  <Typography variant="inherit" fontWeight={"bold"}>
                    Пока нет комментариев...
                  </Typography>
                </Box>
              )}
              currentUser={
                !!currentUser?.id
                  ? {
                      currentUserId: `${currentUser?.id}`,
                      currentUserImg: `${currentUserProfileBlobUrl}`,
                      currentUserProfile: "#",
                      currentUserFullName: currentUser?.partner?.fullName,
                    }
                  : null
              }
              onSubmitAction={(data: CommentType) => {
                const requestBody = preparingRequestBody(data, "comment");
                const callback = (data: Record<string, any>) => {
                  if (data.status != 0) enqueueSnackbar("Что то пошло не так", { variant: "error" });
                };

                handleSubmit(requestBody, callback);
              }}
              onReplyAction={(data: Record<string, any>) => {
                const requestBody = preparingRequestBody(data, "reply");
                const parentCommentId =
                  data?.parentOfRepliedCommentId !== undefined
                    ? data?.parentOfRepliedCommentId
                    : data?.repliedToCommentId;

                const callback = (data: Record<string, any>) => {
                  if (data.status == 0) {
                    const replyCommentId = data.data[0].id;
                    const requestBody = {
                      data: {
                        comments: { id: replyCommentId },
                        parentComment: { id: parentCommentId },
                      },
                    };

                    commentsStore.replyComment(requestBody, (data: Record<string, any>) => {
                      if (data.status != 0) enqueueSnackbar("Что то пошло не так", { variant: "error" });
                    });
                  }
                };
                handleSubmit(requestBody, callback);
              }}
              onDeleteAction={(data: Record<string, any>) => {
                if (data.parentOfDeleteId != undefined) {
                  commentsStore.deleteReplyComment(data.comIdToDelete, (data: Record<string, any>) => {
                    if (data.status == 0) enqueueSnackbar("Комментарий успешно удалено", { variant: "success" });
                  });
                } else {
                  commentsStore.deleteComment(data.comIdToDelete, (data: Record<string, any>) => {
                    if (data.status == 0) enqueueSnackbar("Комментарий успешно удалено", { variant: "success" });
                  });
                }
              }}
            />
          </div>
        )}
      </Stack>
    </Stack>
  );
}
