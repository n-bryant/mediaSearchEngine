(function() {
  "use strict";

  const mediaSearchModule = function() {
    const closeBtn = document.querySelector('.close');
    const feelingLucky = document.querySelector('.lucky');
    const mediaContainer = document.querySelector('.media-container');
    const lightbox = document.querySelector('.lightbox');
    const loadingContainer = document.querySelector('.loading-container');
    const results = document.querySelector('.results');
    const searchContainer = document.querySelector('.search-container');
    const searchForm = document.querySelector('.search-form');
    const tenLatest = document.querySelector('.ten-latest');

    let currentSearch = '';
    let filteredData = [];
    let searchParameter = '';

    // namespace for setting the load icon
    const loading = {
      show() {
        loadingContainer.classList.remove('is-hidden');
      },
      hide() {
        loadingContainer.classList.add('is-hidden');
      }
    };

    // collect search value on submit
    function bindEvents() {
      closeBtn.addEventListener('click', () => {
        lightbox.classList.add('is-hidden');
        mediaContainer.innerHTML = '';
      });
      searchForm.addEventListener('submit', () => {
        event.preventDefault();
        currentSearch = event.target[0].value.toLowerCase();
        console.log(currentSearch);
        searchParameter = 'search';
        searchForm.reset();
        getMediaData(searchParameter);
      });
      feelingLucky.addEventListener('click', () => {
        searchParameter = 'random';
        getMediaData(searchParameter);
      });
      tenLatest.addEventListener('click', () => {
        searchParameter = 'latest';
        getMediaData(searchParameter);
      });
    }

    // display data as list of thumbnails
    function buildMediaList(data) {
      // console.log(data);
      let lastItem = null;

      // build list item for each item in data set
      for (let index = 0; index < data.length; index++) {
        // build item to hold img
        const result = document.createElement('li');
        result.classList = 'result';
        results.appendChild(result);

        // build img tag
        const media = document.createElement('img');
        media.src = data[index].smallURL;
        media.dataset.large = data[index].largeURL;
        result.appendChild(media);

        if (index === data.length - 1) {
          lastItem = media;
        }
      };
      //hide loading screen on thubmail load
      lastItem.addEventListener('load', () => {
        loading.hide();
      });
      lightboxHandler();
    }

    // clear previous search results
    function clearPrev() {
      filteredData = [];
      results.innerHTML = '';
    }

    // filter data for what is needed
    function filterMediaList(mediaData) {
      clearPrev();
      let tempObj = {};

      // random search parameter is an object, not an array
      if (searchParameter !== 'random') {
        let searchArray = mediaData.images;
        // console.log(mediaData.images);

        // grab image small url, large url, and source
        for (let index = 0; index < searchArray.length; index++) {
          tempObj = {};
          // add properties
          tempObj.smallURL = searchArray[index].url;
          tempObj.largeURL = searchArray[index].large_url;
          tempObj.source = searchArray[index].source_id;
          filteredData.push(tempObj);
        }
      }
      else {
        tempObj.smallURL = mediaData.url;
        tempObj.largeURL = mediaData.large_url;
        tempObj.source = mediaData.source_id;
        filteredData.push(tempObj);
      }
      console.log(filteredData);
      buildMediaList(filteredData);
    }

    // pass search value to API and return data
    function getMediaData(parameter) {
      loading.show();

      let fetchURL = `http://www.splashbase.co/api/v1/images/${parameter}`;
      if (parameter === 'search') {
        fetchURL += `?query=${encodeURIComponent(currentSearch)}`;
        console.log(fetchURL);
      }

      // fetch data
      const http = new XMLHttpRequest();
      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
          // console.log(JSON.parse(http.response));
          const data = JSON.parse(http.response);
          filterMediaList(data);
        }
      }

      http.open('GET', fetchURL, true);
      http.send();
    }

    function getSource(sourceID) {
      let fetchURL = `http://www.splashbase.co/api/v1/images/${sourceID}`;
      return fetchURL;
    }

    function lightboxHandler() {
      const items = document.querySelectorAll('.results li'); // node list
      for (let index = 0; index < items.length; index++) {
        let item = items[index].children[0];
        item.addEventListener('click', () => {
          loading.show();

          let lightboxMedia = null;
          // add media to lightbox
          if (item.src.substr(item.src.length - 3) !== 'mp4'
           || item.src.substr(item.src.length - 3) !== 'ogg'
           || item.src.substr(item.src.length - 4) !== 'webm') {
            lightboxMedia = document.createElement('img');
            lightboxMedia.src = filteredData[index].largeURL;
            console.log(lightboxMedia);
          } else { // if video, autoplay video and include controls
            lightboxMedia = document.createElement('video');
            video.autoplay = true;
            video.controls = true;
            lightboxMedia.src = filteredData[index].largeURL;
          }

          // keeps original src if largeURL is unavailable
          if (filteredData[index].largeURL === null) {
            lightboxMedia.src = item.src;
          }
          mediaContainer.appendChild(lightboxMedia);

          // add source info link as image caption
          let srcLink = document.createElement('a');
          srcLink.href = getSource(filteredData[index].source);
          srcLink.target = '_blank';
          mediaContainer.appendChild(srcLink);

          let caption = document.createElement('figcaption');
          caption.innerHTML = item.src;
          srcLink.appendChild(caption);

          // show lightbox
          lightboxMedia.addEventListener('load', () => {
            loading.hide();
            lightbox.classList.remove('is-hidden');
          });
        });
      }
    }

    function init() {
      bindEvents();
    }

    return {
      init: init
    }
  };

  const mediaSearchApp = mediaSearchModule();
  mediaSearchApp.init();

})();
