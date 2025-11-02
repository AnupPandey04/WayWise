let taxSwitch = document.getElementById("flexSwitchCheckDefault");

if (taxSwitch) {
  taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    
    Array.from(taxInfo).forEach(info => {
      if (info.style.display !== "inline") {
        info.style.display = "inline";
      } else {
        info.style.display = "none";
      }
    });
  });
}