"use strict";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $searchForm = $("#search-form");
const defaultImage = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(q) {
  const res = await axios.get("https://api.tvmaze.com/search/shows", { params: { q } });

  return res.data.map((val) => {
    return {
      id: val.show.id,
      name: val.show.name,
      summary: val.show.summary,
      image: val.show.image ? val.show.image.medium : defaultImage,
    };
  });
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return res.data.map((val) => {
    return {
      id: val.id,
      name: val.name,
      season: val.season,
      number: val.number,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="show col-md-12 col-lg-6 mb-4">
         <div class="row media">

           <img 
              src=${show.image}
              alt=${show.name} 
              class="col w-25 mr-3">
           <div class="col media-body">
             <h5 class="fw-bold text-success">${show.name}</h5>
             <div><small>${show.summary}</small></div>

              <button class="btn btn-success btn-sm show-get-episodes" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom">
                 Episodes
               </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

function populateEpisodes(episodes) {
  for (let episode of episodes) {
    const $episode = $(`<li class="list-group-item">S${episode.season}:E${episode.number} - ${episode.name}</li>`);

    $episodesList.append($episode);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  populateShows(shows);
}

async function getEpisodesAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$searchForm.on("submit", async function (e) {
  e.preventDefault();
  await searchForShowAndDisplay();
});

$($showsList).on("click", "button", async function (e) {
  $episodesList.empty();
  await getEpisodesAndDisplay($(e.target).parents(".show")[0].dataset.showId);
});
