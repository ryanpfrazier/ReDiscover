$('document').ready(function() {
  let theAccessToken = '';
  let userID = '';
  let playlistID = '';
  let playlistURI = [];
  let tracksToAdd = { };
  let artistIDArray = [];
  let showAlert = function() {
    $("#danger-alert").alert();
    $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
      $("#danger-alert").slideUp(500);
    });
  };

  function allowRediscover() {
    if (artistIDArray.length === 0) {
      $('#clickMeNow').hide();
    }
    else {
      $('#clickMeNow').show();
    }
  }

  allowRediscover();

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

  function searchForArtist() {
    getCookie('accessToken');
    $('#cardHolder').text('');
    let artist = ($('#artistVal').val()).replace(/\W+/g, '%20');

    return $.ajax({
      method: "GET",
      url: `https://api.spotify.com/v1/search?q=${artist}&type=artist`,
      dataType: "json",
      headers: {
        Authorization: `Bearer ${theAccessToken}`
      },
      error: function() {
        console.log('Error searching for artist');
      }
    });
  }

  function appendArtist(data) {
    let artistResult = data.artists.items;

    for (let i = 0; i < artistResult.length; i++) {
      let individualArtists = artistResult[i];
      let artistName = individualArtists.name;
      let image = '../images/spotify-icon.png';
      let uri = individualArtists.id;

      if ((individualArtists.images).length > 0) {
        image = individualArtists.images[0].url;
      }
      $('#cardHolder').append(`<div class="col-sm-6 cardHeight"><div class="card"><img class="card-img-top cardsImg" src=${image}><button id="${uri}" name="${artistName}" class="cardButton btn btn-default btn-lg hvr-radial-out1">${artistName}</button></div></div>`);
    }
    allowRediscover();
  }

  function alertSameArtist() {
    $(event.target).parent().parent().prepend(`<div class="alert alert-dumb" id="danger-alert"><button type="button" class="close" id="closeX" data-dismiss="alert">x</button><strong>Woah! </strong>Don't add the same artist twice!</div>`);
    showAlert();
  }

  function alertTooManyArtists() {
    $(event.target).parent().parent().prepend(`<div class="alert alert-dumb" id="danger-alert"><button type="button" class="close" id="closeX" data-dismiss="alert">x</button><strong>Oh no! </strong>You'll need to take an artist off before adding more.</div>`);
    showAlert();
  }

  function alertingUser() {
    if (artistIDArray.length < 5) {
      let artistX = (event.target).id;
      let artistName = $(event.target).attr('name');

      if (artistIDArray.indexOf(artistX) === -1) {
        artistIDArray.push(artistX);
        $('.site-wrapper-inner').prepend(`<button id=${artistX} class="btn btn-default btn-md buttonss artistAdded hvr-radial-out">${artistName}</button>`);
      }
      else {
        alertSameArtist();
      }
    }
    else {
      alertTooManyArtists();
    }
    allowRediscover();
  }

  // Artists Search and Display
  $('#artistSearch').click(function() {
    searchForArtist()
    .then(appendArtist);
  });

  $('#cardHolder').on('click', '.cardButton', function() {
    $('#danger-alert').remove();
    alertingUser();
  });

  $('.site-wrapper-inner').on('click', '.artistAdded', function() {
    let artistID = $(event.target).attr("id");
    let position = artistIDArray.indexOf(artistID);

    artistIDArray.splice(position);
    $(event.target).remove();
    allowRediscover();
  });

  $('#clickMeNow').on('click', function() {
    localStorage.clear();
    let artistString = '';
    let playlistName = $('#playlistName').val();
    let valence = $('#targetValence').val();
    let energy = $('#targetEnergy').val();
    let dance = $('#targetDanceability').val();
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

    function pushArtistsIntoArray(data) {
      artistString = artistIDArray.join();
    }

    function getRecommendationsBasedOnArtists() {
      let recommendationURL = '';

      if (valence === '0.57' && energy === '0.57' && dance === '0.57') {
        recommendationURL = `https://api.spotify.com/v1/recommendations?market=US&&limit=${songCount}&seed_artists=${artistString}`;
      }
      else {
        recommendationURL = `https://api.spotify.com/v1/recommendations?market=US&target_valence=${valence}&target_energy=${energy}&target_danceability=${dance}&limit=${songCount}&seed_artists=${artistString}`;
      }

      return $.ajax({
        method: "GET",
        url: recommendationURL,
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

    function goToWebPlayer() {
      if (localStorage.length === 3) {
        window.location = 'player.html';
      }
      else {
        setTimeout(goToWebPlayer(), 100);
      }
    }

    getCookie("accessToken");

    getUserID()
    .then(createPlaylist)
    .then(savePlaylistID)
    .then(pushArtistsIntoArray)
    .then(getRecommendationsBasedOnArtists)
    .then(setURIArray)
    .then(addTracksToPlaylist)
    .then(getPlaylistToSaveToLocalStorage)
    .then(savePlaylistToLocalStorage)
    .then(goToWebPlayer);
  });
});
