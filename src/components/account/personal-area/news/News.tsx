import CreateNews from "./CreateNews";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import React, { useState, useEffect, useContext } from "react";
import { useUserNewsStore } from "@/stores/personal-area/news/user-news";
import NewsCard from "@/components/account/personal-area/news/NewsCard";
import NewsFilter from "@/components/account/personal-area/news/NewsFilter";
import { Box, Stack, Grid, CircularProgress, Typography, Pagination } from "@mui/material";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

const NEWS_LIMIT = 5;

const News = () => {
  const newsStore = useUserNewsStore();
  const [page, setPage] = useState<number>(1);
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [_requestBody, setRequestBody] = useState<Record<string, any> | null>(null);

  const reloadNews = () => {
    setLoadingNews(true);
    if (_requestBody) newsStore.fetchAllNews(_requestBody).then(() => setLoadingNews(false));
  };

  const handlePaginationChange = (e: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  useEffect(() => {
    if (!!currentUser) {
      let criteria = [];
      const offset = Number(page - 1) * NEWS_LIMIT;

      if (filter) criteria.push(filter);

      if (!(currentUserRoles?.isManager || currentUserRoles?.isAdmin || currentUserRoles?.isSubManager)) {
        const role = currentUserRoles?.isAgent ? "agent" : currentUserRoles?.isSubagent ? "subagent" : null;
        if (role) criteria.push({ fieldName: "forWhom", operator: "=", value: role });
      }

      const reqBody = {
        offset: offset,
        limit: NEWS_LIMIT,
        sortBy: ["-createdOn"],
        ...(criteria.length > 0 && {
          data: {
            criteria: criteria,
          },
        }),
      };

      setLoadingNews(true);
      setRequestBody(reqBody);
      newsStore.fetchAllNews(reqBody).then(() => setLoadingNews(false));
      setIsAvailable(!!(currentUserRoles?.isAdmin || currentUserRoles?.isManager));
    }
    return () => {
      newsStore.clearStore();
    };
  }, [currentUser, filter, page]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext, page]);

  return (
    <>
      <Box sx={{ height: "70vh", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ width: "95%" }}>
            <NewsFilter currentUser={currentUser} currentUserRoles={currentUserRoles} setFilter={setFilter} />
          </Box>
          <Box sx={{ width: "5%" }}>
            {(isAvailable || currentUserRoles?.isSubManager) && <CreateNews reloadNews={reloadNews} />}
          </Box>
        </Box>
        <Stack gap={3} sx={{ flex: 1, minHeight: 0 }}>
          <Box
            sx={{
              py: 2,
              px: 3,
              overflowY: "auto",
              maxHeight: "100%",
            }}
          >
            {newsStore.news === null ? (
              <>
                {loadingNews ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="inherit" color={"inherit"}>
                      Загрузка новостей...
                    </Typography>
                    <CircularProgress color="inherit" size={15} />
                  </Box>
                ) : (
                  <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                    Результат не найден...
                  </Typography>
                )}
              </>
            ) : (
              <Grid container spacing={3}>
                {newsStore.news.map((post: Record<string, any>) => (
                  <Grid item key={post?.id} xs={12}>
                    <NewsCard post={post} reloadNews={reloadNews} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      </Box>

      {newsStore.newsTotal > NEWS_LIMIT && (
        <Stack spacing={2} mt={2}>
          <Pagination
            page={page}
            onChange={handlePaginationChange}
            count={Math.ceil(newsStore.newsTotal / NEWS_LIMIT)}
          />
        </Stack>
      )}
    </>
  );
};

export default News;
