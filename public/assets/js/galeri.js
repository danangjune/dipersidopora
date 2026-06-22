document.addEventListener("DOMContentLoaded", function () {
    const folders = document.querySelectorAll('.folder');
    const modalTitle = document.getElementById('modalTitle');

    folders.forEach(folder => {
        folder.addEventListener('click', function () {
            const folderTitle = this.querySelector('p').innerText;
            modalTitle.innerText = folderTitle;
        });
    });

})
function openFolder(folderId) {
    var iframe = document.getElementById('folder-frame');
    iframe.src = 'https://drive.google.com/embeddedfolderview?id=' + folderId + '#grid';
    var modal = document.getElementById('folderModal');
    modal.style.display = 'block';
}

function closeModal() {
    var modal = document.getElementById('folderModal');
    modal.style.display = 'none';
    var iframe = document.getElementById('folder-frame');
    iframe.src = '';
}

window.onclick = function (event) {
    var modal = document.getElementById('folderModal');
    if (event.target == modal) {
        modal.style.display = 'none';
        var iframe = document.getElementById('folder-frame');
        iframe.src = '';
    }
}