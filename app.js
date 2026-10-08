// Carrega dados salvos ou inicializa arrays vazios
let livros = JSON.parse(localStorage.getItem('biblioteca_livros')) || [];
let usuarios = JSON.parse(localStorage.getItem('biblioteca_usuarios')) || [];
let emprestimos = JSON.parse(localStorage.getItem('biblioteca_emprestimos')) || [];

// Elementos do DOM
const formLivro = document.getElementById('form-livro');
const formUsuario = document.getElementById('form-usuario');
const formEmprestimo = document.getElementById('form-emprestimo');

const selectLivro = document.getElementById('select-livro');
const selectUsuario = document.getElementById('select-usuario');

const tabelaEmprestimos = document.getElementById('tabela-emprestimos');
const tabelaLivros = document.getElementById('tabela-livros');
const tabelaUsuarios = document.getElementById('tabela-usuarios');

// Salva o estado atual no localStorage
function salvarDados() {
  localStorage.setItem('biblioteca_livros', JSON.stringify(livros));
  localStorage.setItem('biblioteca_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('biblioteca_emprestimos', JSON.stringify(emprestimos));
}

// Alternar entre as Abas
window.alternarAba = function(nomeAba, elementoBotao) {
  document.querySelectorAll('.tab-content').forEach(aba => aba.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`aba-${nomeAba}`).classList.add('active');
  elementoBotao.classList.add('active');
};

// Atualiza os selects de seleção de Livros e Usuários
function atualizarSelects() {
  selectLivro.innerHTML = '<option value="">Selecione...</option>';
  selectUsuario.innerHTML = '<option value="">Selecione...</option>';

  livros.forEach((livro, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${livro.titulo} (${livro.autor})`;
    selectLivro.appendChild(option);
  });

  usuarios.forEach((usuario, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${usuario.nome} (${usuario.email})`;
    selectUsuario.appendChild(option);
  });
}

// Renderiza a tabela do histórico de empréstimos
function renderizarEmprestimos() {
  tabelaEmprestimos.innerHTML = '';

  if (emprestimos.length === 0) {
    tabelaEmprestimos.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum empréstimo registrado.</td></tr>';
    return;
  }

  emprestimos.forEach((emp, index) => {
    const tr = document.createElement('tr');

    const statusBadge = emp.status === 'em aberto' 
      ? `<span class="badge badge-aberto">Em Aberto</span>` 
      : `<span class="badge badge-devolvido">Devolvido</span>`;

    const botaoAcao = emp.status === 'em aberto' 
      ? `<button class="btn btn-devolution" onclick="registrarDevolucao(${index})">Devolver</button>` 
      : '-';

    tr.innerHTML = `
      <td><strong>${emp.tituloLivro}</strong></td>
      <td>${emp.autorLivro}</td>
      <td>
        ${emp.nomeUsuario}
        <span class="usuario-email">${emp.emailUsuario || ''}</span>
      </td>
      <td>${emp.dataEmprestimo}</td>
      <td>${emp.dataDevolucao || '-'}</td>
      <td>${statusBadge}</td>
      <td>${botaoAcao}</td>
    `;

    tabelaEmprestimos.appendChild(tr);
  });
}

// Renderiza a tabela de livros cadastrados
function renderizarLivros() {
  tabelaLivros.innerHTML = '';

  if (livros.length === 0) {
    tabelaLivros.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum livro cadastrado.</td></tr>';
    return;
  }

  livros.forEach((livro, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${livro.titulo}</strong></td>
      <td>${livro.autor}</td>
      <td><button class="btn btn-delete" onclick="excluirLivro(${index})">Excluir</button></td>
    `;
    tabelaLivros.appendChild(tr);
  });
}

// Renderiza a tabela de usuários cadastrados
function renderizarUsuarios() {
  tabelaUsuarios.innerHTML = '';

  if (usuarios.length === 0) {
    tabelaUsuarios.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  usuarios.forEach((usuario, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${usuario.nome}</strong></td>
      <td>${usuario.email}</td>
      <td><button class="btn btn-delete" onclick="excluirUsuario(${index})">Excluir</button></td>
    `;
    tabelaUsuarios.appendChild(tr);
  });
}

// Função para excluir um livro
window.excluirLivro = function(index) {
  if (confirm(`Tem certeza que deseja excluir o livro "${livros[index].titulo}"?`)) {
    livros.splice(index, 1);
    salvarDados();
    atualizarSelects();
    renderizarLivros();
  }
};

// Função para excluir um usuário
window.excluirUsuario = function(index) {
  if (confirm(`Tem certeza que deseja excluir o usuário "${usuarios[index].nome}"?`)) {
    usuarios.splice(index, 1);
    salvarDados();
    atualizarSelects();
    renderizarUsuarios();
  }
};

// Evento: Cadastrar Livro
formLivro.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = document.getElementById('livro-titulo').value.trim();
  const autor = document.getElementById('livro-autor').value.trim();

  if (titulo && autor) {
    livros.push({ titulo, autor });
    salvarDados();
    atualizarSelects();
    renderizarLivros();
    formLivro.reset();
  }
});

// Evento: Cadastrar Usuário
formUsuario.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('usuario-nome').value.trim();
  const email = document.getElementById('usuario-email').value.trim();

  if (nome && email) {
    usuarios.push({ nome, email });
    salvarDados();
    atualizarSelects();
    renderizarUsuarios();
    formUsuario.reset();
  }
});

// Evento: Registrar Empréstimo
formEmprestimo.addEventListener('submit', (e) => {
  e.preventDefault();
  const livroIndex = selectLivro.value;
  const usuarioIndex = selectUsuario.value;

  if (livroIndex !== '' && usuarioIndex !== '') {
    const livroSelecionado = livros[livroIndex];
    const usuarioSelecionado = usuarios[usuarioIndex];
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const novoEmprestimo = {
      tituloLivro: livroSelecionado.titulo,
      autorLivro: livroSelecionado.autor,
      nomeUsuario: usuarioSelecionado.nome,
      emailUsuario: usuarioSelecionado.email,
      dataEmprestimo: dataAtual,
      dataDevolucao: null,
      status: 'em aberto'
    };

    emprestimos.unshift(novoEmprestimo);
    salvarDados();
    renderizarEmprestimos();
    formEmprestimo.reset();
  }
});

// Função para dar baixa em um empréstimo
window.registrarDevolucao = function(index) {
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  emprestimos[index].dataDevolucao = dataAtual;
  emprestimos[index].status = 'devolvido';

  salvarDados();
  renderizarEmprestimos();
};

// Inicialização da aplicação
atualizarSelects();
renderizarEmprestimos();
renderizarLivros();
renderizarUsuarios();