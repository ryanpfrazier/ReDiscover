$('document').ready(function() {
  // Get accessToken and save for later
  $('#clickMeNow').on('click', function() {
    let userID = '';
    let playlistID = '';
    let playlistURI = [];
    let tracksToAdd = {};
    let gimmeDatAccessToken = '';
    let playlistName = $('#playlistName').val();
    let valence = $('#targetValence').val();
    let energy = $('#targetEnergy').val();
    let dance = $('#targetDanceability').val();
    let songCount = $('#songCount').val();

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
          gimmeDatAccessToken = cThis.substring(name.length, cThis.length);
        }
      }

      return "";
    }

    getCookie("accessToken");

    // Get UserID
    $.ajax({
      method: "GET",
      url: "https://api.spotify.com/v1/me",
      dataType: "json",
      headers: {
        Authorization: `Bearer ${gimmeDatAccessToken}`
      },

      // Create Playlist and hold onto playlist ID
      success: function(theUser) {
        userID = theUser.id;

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
            Authorization: `Bearer ${gimmeDatAccessToken}`
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
      url: "https://api.spotify.com/v1/me/top/artists?&limit=5",
      dataType: "json",
      headers: {
        Authorization: `Bearer ${gimmeDatAccessToken}`
      },
      success: function(data) {
        let artistArray = data.items;
        let artistIDArray = [];

        $("#topArtists").text('');

        for (let x in artistArray) {
          // console.log(artistArray[x]);
          let artistX = artistArray[x].id;

          artistIDArray.push(artistX);

          $("#topArtists").append(`<p>${parseInt(x) + 1}. ${artistArray[x].name}</p>`);
        }
        let artistString = artistIDArray.join();

        console.log('playlistName, valence, energy, dance, songCount..', playlistName, valence, energy, dance, songCount);

        // // Get recommendation track uri's and push into array, then push array into object
        if (valence === '0.57' && energy === '0.57' && dance === '0.57') {
          $.ajax({
            method: "GET",
            url: `https://api.spotify.com/v1/recommendations?market=US&&limit=${songCount}&seed_artists=${artistString}`,
            dataType: "json",
            headers: {
              Authorization: `Bearer ${gimmeDatAccessToken}`
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
              $.ajax({
                method: "POST",
                url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
                contentType: 'application/json',
                dataType: "json",
                headers: {
                  Authorization: `Bearer ${gimmeDatAccessToken}`
                },
                data: JSON.stringify(tracksToAdd),
                success: function(playlist) {
                  console.log('got this far');
                  $.ajax({
                    method: "GET",
                    url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}`,
                    dataType: "json",
                    headers: {
                      Authorization: `Bearer ${gimmeDatAccessToken}`
                    },
                    success: function(finalPlaylist) {
                      localStorage.setItem('finalPlaylist...', JSON.stringify(finalPlaylist));
                      window.location = "player.html";
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

          // console.log(artistString);
        }
        else {
          $.ajax({
            method: "GET",
            url: `https://api.spotify.com/v1/recommendations?market=US&target_valence=${valence}&target_energy=${energy}&target_danceability=${dance}&limit=${songCount}&seed_artists=${artistString}`,
            dataType: "json",
            headers: {
              Authorization: `Bearer ${gimmeDatAccessToken}`
            },
            success: function(data1) {
              console.log('vals', data1);
              playlistURI = [];
              let trackRecommendations = data1.tracks;

              for (let x in trackRecommendations) {
                // console.log('trackRecommendations',trackRecommendations[x]);
                let trackID = trackRecommendations[x].id;

                playlistURI.push(trackID);
              }
              console.log("playlistURI with targets...", playlistURI);

              tracksToAdd = {
                uris: playlistURI
              };
              console.log('tracksToAdd...', tracksToAdd);
              $.ajax({
                method: "POST",
                url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
                contentType: 'application/json',
                dataType: "json",
                headers: {
                  Authorization: `Bearer ${gimmeDatAccessToken}`
                },
                data: JSON.stringify(tracksToAdd),
                success: function(playlist) {
                  $.ajax({
                    method: "GET",
                    url: `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}`,
                    dataType: "json",
                    headers: {
                      Authorization: `Bearer ${gimmeDatAccessToken}`
                    },
                    success: function(finalPlaylist) {
                      localStorage.setItem('finalPlaylist...', JSON.stringify(finalPlaylist));
                      window.location = "player.html";
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
