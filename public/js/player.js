$(document).ready(function() {
  let playlistID = localStorage.getItem('playlistID');
  let finalPlaylist = localStorage.getItem('finalPlaylist...');

  console.log('finalPlaylist...', JSON.parse(finalPlaylist));

  let webPlayerHolder = $('#webPlayerHolder');

  webPlayerHolder.append(`<iframe id="webPlayer" src="https://embed.spotify.com/?uri=spotify:user:ryanfrazier:playlist:${playlistID}&theme=white" frameborder="0" allowtransparency="true"></iframe><br><a href="stuff.html" class="btn btn-default btn-lg">Back to playlist maker</a>`);
});
