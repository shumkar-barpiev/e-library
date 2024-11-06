"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { isProduction } from "@/utils/utils";
import { useSearchParams } from "next/navigation";
import Snackbar from "@/components/other/Snackbar";
import { useUserStore } from "@/stores/users/users";
import { Suspense, useEffect, useState } from "react";
import { UserNewsType } from "@/models/user-news/user-news";
import { useUserNewsStore } from "@/stores/personal-area/news/user-news";
import { Box, Card, CardHeader, Divider, Button, CircularProgress, Typography } from "@mui/material/";
import { CurrentUserProvider } from "@/components/account/personal-area/current-user/CurrentUserProvider";
const NewsDetails = dynamic(() => import("@/components/account/personal-area/news/NewsDetails"), {
  ssr: false,
});

function NewsCard() {
  const router = useRouter();
  const userStore = useUserStore();
  const newsStore = useUserNewsStore();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const [post, setPost] = useState<UserNewsType | null>(null);
  const [loadingPost, setLoadingPost] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<Record<string, any> | null>(null);

  const getCurrentUserIdCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      setCurrentUserId(data?.data?.id);
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const handleGoBack = () => {
    localStorage.setItem("activeTab", "5");
    const initialAddress = isProduction ? "/foms/front/account.html" : "/account";
    router.push(initialAddress);
  };

  const reloadTheCurrentNews = () => {
    setLoadingPost(true);
    newsStore.fetchNewsById(Number(postId), (data: Record<string, any>) => {
      if (data.status === 0) {
        setPost(data?.data[0]);
        setLoadingPost(false);
      } else enqueueSnackbar("Содержание новостей не было перезагружено", { variant: "error" });
    });
  };

  useEffect(() => {
    if (!!currentUserId) {
      const fetchUserPromise = new Promise<void>((resolve, reject) => {
        userStore.fetchUser(currentUserId, (data: Record<string, any>) => {
          if (data.status == 0) {
            setCurrentUser(data.data[0]);
            resolve();
          } else {
            reject(new Error("Failed to fetch user data"));
          }
        });
      });

      const fetchNewsByIdPromise = new Promise<void>((resolve, reject) => {
        newsStore.fetchNewsById(Number(postId), (data: Record<string, any>) => {
          if (data.status === 0) {
            setPost(data?.data[0]);
            resolve();
          } else {
            enqueueSnackbar("Не удалось получить данные новостей", { variant: "error" });
            reject(new Error("Failed to fetch news data"));
          }
        });
      });

      Promise.all([fetchUserPromise, fetchNewsByIdPromise])
        .then(() => {
          setLoadingPost(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [currentUserId, postId]);

  useEffect(() => {
    userStore.getCurrentUserId(getCurrentUserIdCallback);
  }, []);

  return (
    <Box p={2}>
      <Card>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, mr: 3 }}>
          <CardHeader title="Новости" />
          <Button variant="outlined" onClick={handleGoBack}>
            Назад
          </Button>
        </Box>
        <Divider />
        {loadingPost ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, m: 3 }}>
            <Typography variant="inherit" color={"inherit"}>
              Загрузка контента новостей...
            </Typography>
            <CircularProgress color="inherit" size={15} />
          </Box>
        ) : (
          <NewsDetails
            post={post}
            currentUser={currentUser}
            handleGoBack={handleGoBack}
            reloadTheNews={reloadTheCurrentNews}
          />
        )}
      </Card>
    </Box>
  );
}

export default function AccountDetailsPage() {
  return (
    <Suspense>
      <CurrentUserProvider>
        <NewsCard />
      </CurrentUserProvider>
      <Snackbar />
    </Suspense>
  );
}
