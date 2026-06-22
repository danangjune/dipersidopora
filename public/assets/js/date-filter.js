document.addEventListener("DOMContentLoaded", function() {
    var inputTanggal = document.getElementById("tanggal");
    var hasilDiv = document.getElementById("hasil");
  
    inputTanggal.addEventListener("change", function() {
      var tanggal = inputTanggal.value;
      loadData(tanggal);
    });
  
    function loadData(tanggal) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          hasilDiv.innerHTML = this.responseText;
        }
      };
      xhr.open("GET", "data-load.php?tanggal=" + tanggal, true);
      xhr.send();
    }
  });
  