$('document').ready(function() {
  let theAccessToken = '';
  let artistIDArray = [];
  let showAlert = function() {
    $("#danger-alert").alert();
    $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
      $("#danger-alert").slideUp(500);
    });
  };

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

  // Artists Search and Display
  $('#artistSearch').click(function() {
    getCookie("accessToken");
    $('#cardHolder').text('');

    let artist = ($('#artistVal').val()).replace(/\W+/g, '%20');

    $.ajax({
      method: "GET",
      url: `https://api.spotify.com/v1/search?q=${artist}&type=artist`,
      dataType: "json",
      headers: {
        Authorization: `Bearer ${theAccessToken}`
      },
      success: function(data) {
        let artistResult = data.artists.items;

        for (let i = 0; i < artistResult.length; i++) {
          let individualArtists = artistResult[i];

          // console.log(individualArtists);
          let artistName = individualArtists.name;
          let image = '../images/spotify-icon.png';
          let uri = individualArtists.id;

          if ((individualArtists.images).length > 0) {
            image = individualArtists.images[0].url;
          }
          $('#cardHolder').append(`<div class="col-sm-6 cardHeight"><div class="card"><img class="card-img-top cardsImg" src=${image}><button id="${uri}" class="cardButton btn btn-default btn-lg">${artistName}</button></div></div>`);
        }
      },
      error: function() {
        console.log('error on artist search');
      }
    });
  });

  $('#cardHolder').on('click', '.cardButton', function() {
    if (artistIDArray.length < 5) {
      let artistX = (this).id;

      if (artistIDArray.indexOf(artistX) === -1) {
        artistIDArray.push(artistX);
      }
      else {
        $(this).parent().parent().prepend(`<div class="alert alert-dumb" id="danger-alert"><button type="button" class="close" id="closeX" data-dismiss="alert">x</button><strong>Woah! </strong>Don't add the same artist twice!</div>`);

        showAlert();
      }
    }
    else {
      $(this).parent().parent().prepend(`<div class="alert alert-dumb" id="danger-alert"><button type="button" class="close" id="closeX" data-dismiss="alert">x</button><strong>Oh no! </strong>You'll need to take an artist off before adding more.</div>`);

      showAlert();
    }
    console.log(artistIDArray.join());
  });

  // Get accessToken and save for later
  $('#clickMeNow').on('click', function() {
    let userID = '';
    let playlistID = '';
    let playlistURI = [];
    let tracksToAdd = {};
    let playlistName = $('#playlistName').val();
    let valence = $('#targetValence').val();
    let energy = $('#targetEnergy').val();
    let dance = $('#targetDanceability').val();
    let songCount = $('#songCount').val();

    getCookie("accessToken");

    // Get UserID and set in local storage
    $.ajax({
      method: "GET",
      url: "https://api.spotify.com/v1/me",
      dataType: "json",
      headers: {
        Authorization: `Bearer ${theAccessToken}`
      },

      // Create Playlist and set in local storage
      success: function(theUser) {
        userID = theUser.id;
        localStorage.setItem('userID', userID);

        $.ajax({
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
          success: function(newPlaylist) {
            playlistID = newPlaylist.id;
            localStorage.setItem('playlistID', playlistID);
          }
        });
      },
      error: function() {
        console.log('error');
      }
    });

    // Get user's top 5 artists' id's and push into array
    $.ajax({
      method: "GET",
      url: `https://api.spotify.com/v1/me/top/artists?limit=5`,
      dataType: "json",
      headers: {
        Authorization: `Bearer ${theAccessToken}`
      },
      success: function(data) {
        // let artistArray = data.items;
        // let artistIDArray = [];
        //
        // $("#topArtists").text('');
        //
        // for (let x in artistArray) {
        //   // console.log(artistArray[x]);
        //   let artistX = artistArray[x].id;
        //
        //   artistIDArray.push(artistX);
        //
        //   $("#topArtists").append(`<p>${parseInt(x) + 1}. ${artistArray[x].name}</p>`);

        let artistString = artistIDArray.join();

        console.log('playlistName, valence, energy, dance, songCount..', playlistName, valence, energy, dance, songCount);



        // // Get recommendation track uri's and push into array, then push array into object
        if (valence === '0.57' && energy === '0.57' && dance === '0.57') {
          $.ajax({
            method: "GET",
            url: `https://api.spotify.com/v1/recommendations?market=US&&limit=${songCount}&seed_artists=${artistString}`,
            dataType: "json",
            headers: {
              Authorization: `Bearer ${theAccessToken}`
            },
            success: function(data1) {
              console.log('no vals', data1);
              playlistURI = [];
              let trackRecommendations = data1.tracks;

              for (let x in trackRecommendations) {
                // console.log('trackRecommendations',trackRecommendations[x]);
                let trackID = trackRecommendations[x].uri;

                playlistURI.push(trackID);
              }
              console.log("playlistURI without targets...", playlistURI);

              tracksToAdd = {
                uris: playlistURI
              };
              console.log('tracksToAdd...', tracksToAdd);
              console.log(playlistID);
              $.ajax({
                method: "POST",
                url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
                contentType: 'application/json',
                dataType: "json",
                headers: {
                  Authorization: `Bearer ${theAccessToken}`
                },
                data: JSON.stringify(tracksToAdd),
                success: function(playlist) {
                  $.ajax({
                    method: "GET",
                    url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}`,
                    dataType: "json",
                    headers: {
                      Authorization: `Bearer ${theAccessToken}`
                    },
                    success: function(finalPlaylist) {
                      console.log('here');
                      localStorage.setItem('finalPlaylist...', JSON.stringify(finalPlaylist));

                      // window.location = "player.html";
                    }
                  });
                },
                error: function() {
                  console.log('error on adding tracks to playlist');
                }
              });
            },
            error: function() {
              console.log('error1');
            }
          });
        }
        else {
          $.ajax({
            method: "GET",
            url: `https://api.spotify.com/v1/recommendations?market=US&target_valence=${valence}&target_energy=${energy}&target_danceability=${dance}&limit=${songCount}&seed_artists=${artistString}`,
            dataType: "json",
            headers: {
              Authorization: `Bearer ${theAccessToken}`
            },
            success: function(data1) {
              console.log('vals', data1);
              playlistURI = [];
              let trackRecommendations = data1.tracks;

              for (let x in trackRecommendations) {
                // console.log('trackRecommendations',trackRecommendations[x]);
                let trackID = trackRecommendations[x].uri;

                playlistURI.push(trackID);
              }
              console.log("playlistURI with targets...", playlistURI);

              tracksToAdd = {
                uris: playlistURI
              };
              console.log('tracksToAdd...', tracksToAdd);

              // what's different?
              $.ajax({
                method: "POST",
                url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
                contentType: 'application/json',
                dataType: "json",
                headers: {
                  Authorization: `Bearer ${theAccessToken}`
                },
                data: JSON.stringify(tracksToAdd),
                success: function(playlist) {
                  $.ajax({
                    method: "GET",
                    url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}`,
                    dataType: "json",
                    headers: {
                      Authorization: `Bearer ${theAccessToken}`
                    },
                    success: function(finalPlaylist) {
                      console.log('now here');
                      localStorage.setItem('finalPlaylist...', JSON.stringify(finalPlaylist));

                      // window.location = "player.html";
                    }
                  });
                },
                error: function() {
                  console.log('error on adding tracks to playlist');
                }
              });
            },
            error: function() {
              console.log('error1');
            }
          });
        }
      },
      error: function() {
        console.log('error on first ajax');
      }
    });
  });
});
