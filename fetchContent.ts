export async function fetchContent(query:string) {
    try {
      const res = await fetch(
        `https://graphql.contentful.com/content/v1/spaces/9dw4krr5xhmc`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer pfui8qi5FdyJV7oktD7isKkqysOdaVN_uJnXMiyZ5Wg`,
          },
          body: JSON.stringify({ query }),
        },
      );
      const { data } = await res.json();
      return data;
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query ${query}`);
      console.error(error);
    }
  }
  
  export default fetchContent;