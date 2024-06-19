    import {populateYearOptions, getDataAndLoadSelect2} from './select2Data.js';
    document.getElementById('category').addEventListener('change', (event) => {
      const category = event.target.value;
      const sYear = {cn: 2017, prodcom: 2021}[category];
      const eYear = {cn: 2024, prodcom: 2024}[category];
      populateYearOptions('year', sYear, eYear);
    });
    document.getElementById('year').addEventListener('change', (event) => {
      const year = event.target.value;
      const category = document.getElementById('category').value;
      getDataAndLoadSelect2(category, year);
    });