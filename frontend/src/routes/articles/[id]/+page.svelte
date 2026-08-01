<script>
  import ArticleDetailCard from "$lib/components/article/ArticleDetailCard.svelte";
  import SidebarAuthor from "$lib/components/article/SidebarAuthor.svelte";
  import SidebarRecommend from "$lib/components/article/SidebarRecommend.svelte";
  import CommentsList from "$lib/components/comment/CommentsList.svelte";

  export let data;
  $: article = data.article;
  const SIDEBAR_W = 400;
</script>

{#key article.id}
  <div class="grid" style={`grid-template-columns:minmax(0,1fr) ${SIDEBAR_W}px;`}>
    <main class="main">
      <ArticleDetailCard
        title={article.title}
        text={article.content}
        images={article.images}
        date={article.date}
        authorName={article.author.name}
        articleId={article.id}
        initialLikeCount={article.likeCount}
        tags={article.tags}
        userId={article.userId}
      />

      <CommentsList articleId={article.id} articleAuthorId={article.userId} />
    </main>

    <aside class="aside">
      <SidebarAuthor name={article.author.name} avatar={article.author.avatar} />
      <SidebarRecommend articleId={article.id} />
    </aside>
  </div>
{/key}

<style>
  .grid {
    display: grid;
    gap: 32px;
    grid-template-columns: minmax(auto, 750px) minmax(auto, 380px);
    padding-left: 80px;
    padding-right: 20px;
  }

  .main {
    width: 100%;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    min-width: 280px;
  }

  @media (max-width: 1200px) {
    .grid {
      grid-template-columns: 1fr !important;
      padding-left: 40px;
      padding-right: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .main {
      max-width: 100%;
    }

    .aside {
      order: 2;
    }
  }

  @media (max-width: 768px) {
    .grid {
      padding-left: 20px;
      padding-right: 20px;
      max-width: 100%;
    }
  }
</style>
