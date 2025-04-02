import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseSync('PysteisDB');

export const initDB = async () => {
  try {
    await db.runAsync('PRAGMA foreign_keys = ON;');

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS pasteis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL,
        categoria_id INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        total REAL NOT NULL
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS venda_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        produto_codigo TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES pasteis(id) ON DELETE CASCADE
      );
    `);

    await inserirDadosIniciais();

    console.log('Banco de dados inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

const inserirDadosIniciais = async () => {
  try {
    await db.runAsync(`
      INSERT OR IGNORE INTO categorias (nome) VALUES 
      ('Salgado'), 
      ('Doce'), 
      ('Especial'), 
      ('Vegetariano');
    `);

    await db.runAsync(`
      INSERT OR IGNORE INTO pasteis (codigo, nome, descricao, preco, categoria_id) VALUES
      ('P001', 'Pastel de Merge Conflict', 'Queijo e presunto - o clássico que sempre funciona', 8.50, 1),
      ('P002', 'Pastel Null Pointer', 'Frango com catupiry - cuidado com as referências nulas', 9.00, 1),
      ('P003', 'Pastel Infinite Loop', 'Calabresa - uma explosão de sabor sem fim', 8.00, 1),
      ('P004', 'Pastel Stack Overflow', 'Camarão - para quem gosta de camadas', 12.00, 3),
      ('P005', 'Pastel Syntax Error', 'Carne seca com abóbora - combinação inesperada', 10.50, 1),
      ('P006', 'Pastel 404', 'Doce de leite - às vezes não encontrado', 7.50, 2);
    `);
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
    throw error;
  }
};

// ==================== OPERAÇÕES PARA CATEGORIAS ====================

export const listarCategorias = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM categorias ORDER BY nome;');
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    throw error;
  }
};

export const buscarCategoriaPorId = async (id) => {
  try {
    const result = await db.getAllAsync('SELECT * FROM categorias WHERE id = ?;', [id]);
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    throw error;
  }
};

export const adicionarCategoria = async (nome) => {
  try {
    const result = await db.runAsync('INSERT INTO categorias (nome) VALUES (?);', [nome]);
    return result;
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    throw error;
  }
};

export const atualizarCategoria = async (id, nome) => {
  try {
    const result = await db.runAsync('UPDATE categorias SET nome = ? WHERE id = ?;', [nome, id]);
    return result;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const removerCategoria = async (id) => {
  try {
    const result = await db.runAsync('DELETE FROM categorias WHERE id = ?;', [id]);
    return result;
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    throw error;
  }
};

// ==================== OPERAÇÕES PARA PRODUTOS ====================

export const listarProdutos = async (categoriaId = null) => {
  try {
    let query = `
      SELECT p.*, c.nome as categoria_nome 
      FROM pasteis p 
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    const params = [];

    if (categoriaId) {
      query += ' WHERE p.categoria_id = ?';
      params.push(categoriaId);
    }

    query += ' ORDER BY p.nome;';
    return await db.getAllAsync(query, params);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    throw error;
  }
};

export const buscarProdutoPorId = async (id) => {
  try {
    const result = await db.getAllAsync(
      `SELECT p.*, c.nome as categoria_nome 
       FROM pasteis p 
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?;`,
      [id]
    );
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

export const adicionarProduto = async (produto) => {
  try {
    const { codigo, nome, descricao, preco, categoria_id } = produto;
    const result = await db.runAsync(
      'INSERT INTO pasteis (codigo, nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?, ?);',
      [codigo, nome, descricao, preco, categoria_id]
    );
    return result;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
};

export const atualizarProduto = async (id, produto) => {
  try {
    const { codigo, nome, descricao, preco, categoria_id } = produto;
    const result = await db.runAsync(
      'UPDATE pasteis SET codigo = ?, nome = ?, descricao = ?, preco = ?, categoria_id = ? WHERE id = ?;',
      [codigo, nome, descricao, preco, categoria_id, id]
    );
    return result;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const removerProduto = async (id) => {
  try {
    // Verifica se o produto está em alguma venda
    const itensVenda = await db.getAllAsync(
      'SELECT id FROM venda_itens WHERE produto_id = ? LIMIT 1;',
      [id]
    );

    if (itensVenda.length > 0) {
      throw new Error('Este pastel está associado a vendas existentes');
    }

    const result = await db.runAsync('DELETE FROM pasteis WHERE id = ?;', [id]);
    return result;
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    throw error;
  }
};

// ==================== OPERAÇÕES PARA VENDAS ====================

export const criarVenda = async () => {
  try {
    const result = await db.runAsync(
      'INSERT INTO vendas (data, total) VALUES (?, 0);',
      [new Date().toISOString()]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    throw error;
  }
};

export const adicionarItemVenda = async (vendaId, item) => {
  try {
    const { produto_id, produto_codigo, quantidade, preco_unitario } = item;
    const result = await db.runAsync(
      `INSERT INTO venda_itens 
       (venda_id, produto_id, produto_codigo, quantidade, preco_unitario) 
       VALUES (?, ?, ?, ?, ?);`,
      [vendaId, produto_id, produto_codigo, quantidade, preco_unitario]
    );
    return result;
  } catch (error) {
    console.error('Erro ao adicionar item à venda:', error);
    throw error;
  }
};

export const atualizarTotalVenda = async (vendaId, total) => {
  try {
    const result = await db.runAsync(
      'UPDATE vendas SET total = ? WHERE id = ?;',
      [total, vendaId]
    );
    return result;
  } catch (error) {
    console.error('Erro ao atualizar total da venda:', error);
    throw error;
  }
};

export const listarVendas = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM vendas ORDER BY data DESC;');
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    throw error;
  }
};

export const buscarItensVenda = async (vendaId) => {
  try {
    return await db.getAllAsync(
      `SELECT vi.*, p.nome, p.codigo 
       FROM venda_itens vi 
       JOIN pasteis p ON vi.produto_id = p.id 
       WHERE vi.venda_id = ?;`,
      [vendaId]
    );
  } catch (error) {
    console.error('Erro ao buscar itens da venda:', error);
    throw error;
  }
};

export const buscarVendaPorId = async (id) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM vendas WHERE id = ?;',
      [id]
    );
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    throw error;
  }
};

// ==================== RELATÓRIOS ====================

export const produtosMaisVendidos = async (limit = 5) => {
  try {
    return await db.getAllAsync(
      `SELECT p.id, p.nome, p.codigo, SUM(vi.quantidade) as total_vendido
       FROM venda_itens vi
       JOIN pasteis p ON vi.produto_id = p.id
       GROUP BY p.id
       ORDER BY total_vendido DESC
       LIMIT ?;`,
      [limit]
    );
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  }
};

export const categoriasMaisVendidas = async (limit = 5) => {
  return await db.getAllAsync(
    `SELECT 
       c.id,
       COALESCE(c.nome, 'Sem categoria') as categoria,
       SUM(vi.quantidade) as total_vendido
     FROM venda_itens vi
     JOIN pasteis p ON vi.produto_id = p.id
     JOIN categorias c ON p.categoria_id = c.id
     GROUP BY c.id
     ORDER BY total_vendido DESC
     LIMIT ?;`,
    [limit]
  );
};

export default db;