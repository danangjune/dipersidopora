document.addEventListener("DOMContentLoaded", function () {
    const albums = document.querySelectorAll('.album');
    const modal = document.getElementById('photoModal');
    const photoGrid = document.getElementById('photoGrid');
    const modalTitle = document.getElementById('modalTitle');
    const span = document.getElementsByClassName('close')[0];

    albums.forEach(album => {
        album.addEventListener('click', function () {
            const albumName = this.getAttribute('data-album');
            const albumTitle = this.querySelector('p').innerText;
            modalTitle.innerText = albumTitle;
            loadPhotos(albumName);
            modal.style.display = "block";
        });
    });

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function loadPhotos(albumName) {
        // Clear existing photos
        photoGrid.innerHTML = '';

        // For demonstration, we'll just use some static photo URLs
        // In a real scenario, you might fetch this data from a server
        const photos = {
            album1: [
                'images/galeri/halalbihalal/halalbihalal1.jpg',
                'images/galeri/halalbihalal/halalbihalal2.jpg',
                'images/galeri/halalbihalal/halalbihalal3.jpg',
                'images/galeri/halalbihalal/halalbihalal4.jpg',
                'images/galeri/halalbihalal/halalbihalal5.jpg',
                'images/galeri/halalbihalal/halalbihalal6.jpg',
                'images/galeri/halalbihalal/halalbihalal7.jpg',
                'images/galeri/halalbihalal/halalbihalal8.jpg',
                'images/galeri/halalbihalal/halalbihalal9.jpg',
                'images/galeri/halalbihalal/halalbihalal10.jpg',
                'images/galeri/halalbihalal/halalbihalal11.jpg',
                'images/galeri/halalbihalal/halalbihalal12.jpg',
                'images/galeri/halalbihalal/halalbihalal13.jpg',
                'images/galeri/halalbihalal/halalbihalal14.jpg',
                'images/galeri/halalbihalal/halalbihalal15.jpg',
                'images/galeri/halalbihalal/halalbihalal16.jpg',
                'images/galeri/halalbihalal/halalbihalal17.jpg',
                'images/galeri/halalbihalal/halalbihalal18.jpg'
                // Add more photo paths
            ],
            album2: [
                'images/galeri/operasipasar/operasipasar1.jpg',
                'images/galeri/operasipasar/operasipasar2.jpg',
                'images/galeri/operasipasar/operasipasar3.jpg',
                'images/galeri/operasipasar/operasipasar4.jpg',
                'images/galeri/operasipasar/operasipasar5.jpg',
                'images/galeri/operasipasar/operasipasar6.jpg',
                'images/galeri/operasipasar/operasipasar7.jpg',
                'images/galeri/operasipasar/operasipasar8.jpg',
                'images/galeri/operasipasar/operasipasar9.jpg',
                'images/galeri/operasipasar/operasipasar10.jpg',
                'images/galeri/operasipasar/operasipasar11.jpg',
                'images/galeri/operasipasar/operasipasar12.jpg',
                'images/galeri/operasipasar/operasipasar13.jpg',
                'images/galeri/operasipasar/operasipasar14.jpg',
                'images/galeri/operasipasar/operasipasar15.jpg',
                'images/galeri/operasipasar/operasipasar16.jpg'
                // Add more photo paths
            ],
            album3: [
                'images/galeri/sidakspbu/sidakspbu1.jpg',
                'images/galeri/sidakspbu/sidakspbu2.jpg',
                'images/galeri/sidakspbu/sidakspbu3.jpg',
                'images/galeri/sidakspbu/sidakspbu4.jpg',
                'images/galeri/sidakspbu/sidakspbu5.jpg',
                'images/galeri/sidakspbu/sidakspbu6.jpg',
                // Add more photo paths
            ],
            album4: [
                'images/galeri/parcel/parcel1.jpg',
                'images/galeri/parcel/parcel2.jpg',
                'images/galeri/parcel/parcel3.jpg',
                'images/galeri/parcel/parcel4.jpg',
                'images/galeri/parcel/parcel5.jpg',
                'images/galeri/parcel/parcel6.jpg',
                'images/galeri/parcel/parcel7.jpg',
                'images/galeri/parcel/parcel8.jpg',
                'images/galeri/parcel/parcel9.jpg',
                'images/galeri/parcel/parcel10.jpg',
                'images/galeri/parcel/parcel11.jpg',
                'images/galeri/parcel/parcel12.jpg',
                'images/galeri/parcel/parcel13.jpg',
                'images/galeri/parcel/parcel14.jpg',
                'images/galeri/parcel/parcel15.jpg',
                'images/galeri/parcel/parcel16.jpg',
                'images/galeri/parcel/parcel17.jpg',
                'images/galeri/parcel/parcel18.jpg',
                'images/galeri/parcel/parcel19.jpg',
                'images/galeri/parcel/parcel20.jpg',
                // Add more photo paths
            ]
            // Add more albums
        };

        if (photos[albumName]) {
            photos[albumName].forEach(photo => {
                const img = document.createElement('img');
                img.src = photo;
                photoGrid.appendChild(img);
            });
        }
    }

});
