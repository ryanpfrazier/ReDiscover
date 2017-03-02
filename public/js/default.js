$('document').ready(function() {
  let theAccessToken = '';
  let userID = '';
  let playlistID = '';
  let playlistURI = [];
  let tracksToAdd = { };
  let artistString = '';

  // Get AccessToken from Cookies
  function getCookie(cname) {
    let name = `${cname}=`;
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let cThis = ca[i];

      while (cThis.charAt(0) === ' ') {
        cThis = cThis.substring(1);
      }
      if (cThis.indexOf(name) === 0) {
        theAccessToken = cThis.substring(name.length, cThis.length);
      }
    }

    return "";
  }

  // Do Everything
  $('#clickMeNow').on('click', function() {
    let timeFrame = $('input[name="timeFrame"]:checked').val();
    let playlistName = $('#playlistName').val();
    let songCount = $('#songCount').val();

    function getUserID() {
      return $.ajax({
        method: "GET",
        url: "https://api.spotify.com/v1/me",
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        error: function() {
          console.log('Get User ID failed');
        }
      });
    }

    function createPlaylist(user) {
      localStorage.clear();
      userID = user.id;

      return $.ajax({
        method: "POST",
        data: JSON.stringify({
          name: playlistName,
          public: false
        }),
        url: `https://api.spotify.com/v1/users/${userID}/playlists`,
        contentType: 'application/json',
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        error: function() {
          console.log('Create Playlist failed');
        }
      });
    }

    function savePlaylistID(newPlaylist) {
      playlistID = newPlaylist.id;
    }

    function getTopFiveArtists() {
      return $.ajax({
        method: "GET",
        url: `https://api.spotify.com/v1/me/top/artists?time_range=${timeFrame}&limit=5`,
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        error: function() {
          console.log('Get Top Five Artists Failed');
        }
      });
    }

    function pushArtistsIntoArray(data) {
      let artistArray = data.items;
      let artistIDArray = [];

      for (let x in artistArray) {
        let artistX = artistArray[x].id;

        artistIDArray.push(artistX);
      }
      artistString = artistIDArray.join();
    }

    function getRecommendationsBasedOnArtists() {
      return $.ajax({
        method: "GET",
        url: `https://api.spotify.com/v1/recommendations?market=US&&limit=${songCount}&seed_artists=${artistString}`,
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        error: function() {
          console.log('Get track recommendations failed');
        }
      });
    }

    function setURIArray(data) {
      playlistURI = [];
      let trackRecommendations = data.tracks;

      for (let x in trackRecommendations) {
        let trackID = trackRecommendations[x].uri;

        playlistURI.push(trackID);
      }
      tracksToAdd = {
        uris: playlistURI
      };
    }

    function addTracksToPlaylist() {
      return $.ajax({
        method: "POST",
        url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
        contentType: 'application/json',
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        data: JSON.stringify(tracksToAdd),
        error: function() {
          console.log('Adding Tracks to Playlist Failed');
        }
      });
    }

    function getPlaylistToSaveToLocalStorage() {
      return $.ajax({
        method: "GET",
        url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}`,
        dataType: "json",
        headers: {
          Authorization: `Bearer ${theAccessToken}`
        },
        error: function() {
          console.log('Saving Playlist to Local Storage Failed');
        }
      });
    }

    function savePlaylistToLocalStorage(finalPlaylist) {
      localStorage.setItem('userID', userID);
      localStorage.setItem('playlistID', playlistID);
      localStorage.setItem('finalPlaylist...', JSON.stringify(finalPlaylist));
    }

    getCookie("accessToken");

    getUserID()
    .then(createPlaylist)
    .then(savePlaylistID)
    .then(getTopFiveArtists)
    .then(pushArtistsIntoArray)
    .then(getRecommendationsBasedOnArtists)
    .then(setURIArray)
    .then(addTracksToPlaylist)
    .then(getPlaylistToSaveToLocalStorage)
    .then(savePlaylistToLocalStorage);
  });
});
