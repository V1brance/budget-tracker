//last to do
var CACHE_NAME = "budget-tracker-cache-v1";
const DATA_CACHE_NAME = "budget-data-cache-v1";

var cachedURLs = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Cache accessed");
      return cache.addAll(cachedURLs);
    })
  );
});

self.addEventListener("fetch", function (event) {
  //want to cache the hits to api routes
  //this way we can handle changes to the budget
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              //returns the cache if we cannot fetch the actual online stuff
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          //sends the home pages for the views cached routes
          return caches.match("/");
        }
      });
    })
  );
});
