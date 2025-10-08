const comboInput = document.getElementById('comboInput');
const optionsList = document.getElementById('optionsList');
const options = optionsList.querySelectorAll('li');
const placeholder = comboInput.querySelector('.placeholder');

window.selectedValues = [];

function updateSelectedTags() {
  // Remove tags antigas
  comboInput.querySelectorAll('.tag').forEach(tag => tag.remove());

  // Adiciona novas tags
  selectedValues.forEach(value => {
    const option = [...options].find(opt => opt.dataset.value === value);
    const span = document.createElement('span');
    span.classList.add('tag');
    span.textContent = option.textContent;
    comboInput.insertBefore(span, placeholder);
  });

  // Alterna placeholder
  placeholder.style.display = selectedValues.length ? 'none' : 'inline';
  console.log(selectedValues)
}

comboInput.addEventListener('click', () => {
  const isOpen = optionsList.style.display === 'block';
  optionsList.style.display = isOpen ? 'none' : 'block';
});

options.forEach(option => {
  option.addEventListener('click', () => {
    const value = option.dataset.value;
    const index = selectedValues.indexOf(value);

    if (index > -1) {
      selectedValues.splice(index, 1);
      option.classList.remove('selected');
    } else {
      selectedValues.push(value);
      option.classList.add('selected');
    }

    updateSelectedTags();
  });
});

document.addEventListener('click', (e) => {
  if (!comboInput.contains(e.target) && !optionsList.contains(e.target)) {
    optionsList.style.display = 'none';
  }
});

