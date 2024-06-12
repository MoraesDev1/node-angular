const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

let idCounters = require("./idCounters.json");
let database = require("./database.json");
const { error } = require('console');

const getNextId = (type) => {
    idCounters[type] += 1;
    fs.writeFileSync('./idCounters.json', JSON.stringify(idCounters, null, 2));
    return idCounters[type];
};

// TABELA PRODUTO
app.get('/product', (req, res) => {
    res.json(database.produto);
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = database.produto.find(product => product.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

app.post('/product', (req, res) => {
    const newProduct = req.body;
    const subgrupoExists = database.produtoSubgrupo.some(subgrupo => subgrupo.id === newProduct.idProdutoSubgrupo);
    const marcaExists = database.produtoMarca.some(marca => marca.id === newProduct.idProdutoMarca);
    const unidadeExists = database.produtoUnidade.some(unidade => unidade.id === newProduct.idProdutoUnidade);

    // verifica se chaves estrangeiras existem
    if (!subgrupoExists) {
        return res.status(400).send({ error: 'Subgrupo informado não existe' });
    }

    if (!marcaExists) {
        return res.status(400).send({ error: 'Marca informada não existe' });
    }

    if (!unidadeExists) {
        return res.status(400).send({ error: 'Unidade informada não existe' });
    }

    // verifica se campos de produto não foram informados
    if (newProduct.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }

    if (newProduct.gtin == null) {
        return res.status(400).send({ error: 'Código gtin não informado' });
    }

    if (newProduct.valor == null) {
        return res.status(400).send({ error: 'Valor não informado' });
    }

    if (newProduct.dataCadastro == null) {
        return res.status(400).send({ error: 'Data do cadastro não informado' });
    }

    //validação dos campos do produto
    if (newProduct.nome.length == 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (newProduct.gtin.length == 0) {
        return res.status(400).send({ error: 'Código gtin não pode ser vazio' });
    }
    if (newProduct.valor.length == 0) {
        return res.status(400).send({ error: 'Valor não pode ser vazio' });
    }
    if (newProduct.dataCadastro.length == 0) {
        return res.status(400).send({ error: 'DataCadstro não pode ser vazio' });
    }

    newProduct.id = getNextId('produto');
    database.produto.push(newProduct);

    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar dados.');
        } else {
            res.status(201).json(newProduct);
        }
    });
});


app.put('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updateProduct = req.body;
    const index = database.produto.findIndex(product => product.id === productId);
    const subgrupoExists = database.produtoSubgrupo.some(subgrupo => subgrupo.id === updateProduct.idProdutoSubgrupo);
    const marcaExists = database.produtoMarca.some(marca => marca.id === updateProduct.idProdutoMarca);
    const unidadeExists = database.produtoUnidade.some(unidade => unidade.id === updateProduct.idProdutoUnidade);

    // verifica se chaves estrangeiras existem
    if (!subgrupoExists) {
        return res.status(400).send({ error: 'Subgrupo informado não existe' });
    }

    if (!marcaExists) {
        return res.status(400).send({ error: 'Marca informada não existe' });
    }

    if (!unidadeExists) {
        return res.status(400).send({ error: 'Unidade informada não existe' });
    }

    // verifica se campos de produto não foram informados
    if (updateProduct.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }

    if (updateProduct.gtin == null) {
        return res.status(400).send({ error: 'Código gtin não informado' });
    }

    if (updateProduct.valor == null) {
        return res.status(400).send({ error: 'Valor não informado' });
    }

    if (updateProduct.dataCadastro == null) {
        return res.status(400).send({ error: 'Data do cadastro não informado' });
    }

    //validação dos campos do produto
    if (updateProduct.nome.length == 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (updateProduct.gtin.length == 0) {
        return res.status(400).send({ error: 'Código gtin não pode ser vazio' });
    }
    if (updateProduct.valor.length == 0) {
        return res.status(400).send({ error: 'Valor não pode ser vazio' });
    }
    if (updateProduct.dataCadastro.length == 0) {
        return res.status(400).send({ error: 'DataCadstro não pode ser vazio' });
    }


    if (index !== -1) {
        database.produto[index] = { ...database.produto[index], ...updateProduct };
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).json(updateProduct);
            }
        });
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

app.delete('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const index = database.produto.findIndex(product => product.id === productId);
    if (index !== -1) {
        database.produto.splice(index, 1);
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).send('Produto detelado');
            }
        });
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

// TABELA SUBGRUPO
app.get('/subgroup', (req, res) => {
    res.json(database.produtoSubgrupo);
});

app.get('/subgroup/:id', (req, res) => {
    const subgroupId = parseInt(req.params.id);
    const subgroup = database.produtoSubgrupo.find(subgroup => subgroup.id === subgroupId);
    if (subgroup) {
        res.json(subgroup);
    } else {
        res.status(404).send('Subgrupo não encontrado');
    }
});

app.post('/subgroup', (req, res) => {
    const newSubgroup = req.body;
    const groupExists = database.produtoGrupo.some(group => group.id === newSubgroup.idProdutoGrupo);

    // verificando FK da tabela
    if (!groupExists) {
        return res.status(400).send({ error: 'ID do grupo informado não existe' });
    }
    // verificando se foram passados todos os atributos
    if (newSubgroup.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }
    if (newSubgroup.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado' });
    }

    //verificando se os atributos não estão vazios
    if (newSubgroup.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (newSubgroup.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio' });
    }

    newSubgroup.id = getNextId('produtoSubgrupo');
    database.produtoSubgrupo.push(newSubgroup);

    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar dados.');
        } else {
            res.status(201).json(newSubgroup);
        }
    });
});

app.put('/subgroup/:id', (req, res) => {
    const subgroupId = parseInt(req.params.id);
    const updateSubgroup = req.body;
    const index = database.produtoSubgrupo.findIndex(subgroup => subgroup.id === subgroupId);
    const groupExists = database.produtoGrupo.some(group => group.id === updateSubgroup.idProdutoGrupo);

    // verificando FK da tabela
    if (!groupExists) {
        return res.status(400).send({ error: 'ID do grupo informado não existe' });
    }
    // verificando se foram passados todos os atributos
    if (updateSubgroup.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }
    if (updateSubgroup.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado' });
    }

    //verificando se os atributos não estão vazios
    if (updateSubgroup.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (updateSubgroup.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio' });
    }

    if (index !== -1) {
        database.produtoSubgrupo[index] = { ...database.produtoSubgrupo[index], ...updateSubgroup };
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).json(updateSubgroup);
            }
        });
    } else {
        res.status(404).send('Subgrupo não encontrado');
    }
});

app.delete('/subgroup/:id', (req, res) => {
    const subgroupId = parseInt(req.params.id);
    const index = database.produtoSubgrupo.findIndex(subgroup => subgroup.id === subgroupId);
    if (index !== -1) {
        database.produtoSubgrupo.splice(index, 1);
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).send('Subgrupo detelado');
            }
        });
    } else {
        res.status(404).send('Subgrupo não encontrado');
    }
});

// TABELA GRUPO
app.get('/group', (req, res) => {
    res.json(database.produtoGrupo);
});

app.get('/group/:id', (req, res) => {
    const groupId = parseInt(req.params.id);
    const group = database.produtoGrupo.find(group => group.id === groupId);
    if (group) {
        res.json(group);
    } else {
        res.status(404).send('Grupo não encontrado');
    }
});

app.post('/group', (req, res) => {
    const newGroup = req.body;
    // verificando se foram passados todos os atributos
    if (newGroup.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }
    if (newGroup.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado' });
    }

    //verificando se os atributos não estão vazios
    if (newGroup.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (newGroup.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio' });
    }

    newGroup.id = getNextId('produtoGrupo');
    database.produtoGrupo.push(newGroup);
    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar dados.');
        } else {
            res.status(201).json(newGroup);
        }
    });
});

app.put('/group/:id', (req, res) => {
    const groupId = parseInt(req.params.id);
    const updateGroup = req.body;
    const index = database.produtoGrupo.findIndex(group => group.id === groupId);

    if (updateGroup.nome == null) {
        return res.status(400).send({ error: 'Nome não informado' });
    }
    if (updateGroup.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado' });
    }

    //verificando se os atributos não estão vazios
    if (updateGroup.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio' });
    }
    if (updateGroup.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio' });
    }

    if (index !== -1) {
        database.produtoGrupo[index] = { ...database.produtoGrupo[index], ...updateGroup };
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).json(updateGroup);
            }
        });
    } else {
        res.status(404).send('Grupo não encontrado');
    }
});

app.delete('/group/:id', (req, res) => {
    const groupId = parseInt(req.params.id);
    const index = database.produtoGrupo.findIndex(group => group.id === groupId);

    if (index !== -1) {
        database.produtoGrupo.splice(index, 1);
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).send('Grupo detelado');
            }
        });
    } else {
        res.status(404).send('Grupo não encontrado');
    }
});

// TABELA UNIDADE
app.get('/unit', (req, res) => {
    res.json(database.produtoUnidade);
});

app.get('/unit/:id', (req, res) => {
    const unitId = parseInt(req.params.id);
    const unit = database.produtoUnidade.find(unit => unit.id === unitId);

    if (unit) {
        res.json(unit);
    } else {
        res.status(404).send('Unidade não encontrada.');
    }
});

app.post('/unit', (req, res) => {
    const newUnit = req.body;
    // verificando se foram passados todos os atributos
    if (newUnit.sigla == null) {
        return res.status(400).send({ error: 'Sigla não informada.' });
    }
    if (newUnit.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informada.' });
    }

    //verificando se os atributos não estão vazios
    if (newUnit.sigla.length === 0) {
        return res.status(400).send({ error: 'Sigla não pode ser vazio.' });
    }
    if (newUnit.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio.' });
    }

    newUnit.id = getNextId('produtoUnidade');
    database.produtoUnidade.push(newUnit);
    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar dados.');
        } else {
            res.status(201).json(newUnit);
        }
    });
});

app.put('/unit/:id', (req, res) => {
    const unitId = parseInt(req.params.id);
    const updateUnit = req.body;
    const index = database.produtoUnidade.findIndex(unit => unit.id === unitId);

    if (updateUnit.sigla == null) {
        return res.status(400).send({ error: 'Sigla não informada.' });
    }
    if (updateUnit.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado.' });
    }

    //verificando se os atributos não estão vazios
    if (updateUnit.sigla.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio.' });
    }
    if (updateUnit.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio.' });
    }

    if (index !== -1) {
        database.produtoUnidade[index] = { ...database.produtoUnidade[index], ...updateUnit };
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).json(updateUnit);
            }
        });
    } else {
        res.status(404).send('Unidade não encontrada.');
    }
});

app.delete('/unit/:id', (req, res) => {
    const unitId = parseInt(req.params.id);
    const index = database.produtoUnidade.findIndex(unit => unit.id === unitId);

    if (index !== -1) {
        database.produtoUnidade.splice(index, 1);
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).send('Unidade deletada.');
            }
        });
    } else {
        res.status(404).send('Unidade não encontrada.');
    }
});

// TABELA MARCA
app.get('/brand', (req, res) => {
    res.json(database.produtoMarca);
});

app.get('/brand/:id', (req, res) => {
    const brandId = parseInt(req.params.id);
    const brand = database.produtoMarca.find(brand => brand.id === unitId);

    if (brand) {
        res.json(brand);
    } else {
        res.status(404).send('Marca não encontrada.');
    }
});

app.post('/brand', (req, res) => {
    const newBrand = req.body;
    // verificando se foram passados todos os atributos
    if (newBrand.nome == null) {
        return res.status(400).send({ error: 'Nome não informado.' });
    }
    if (newBrand.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informada.' });
    }

    //verificando se os atributos não estão vazios
    if (newBrand.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio.' });
    }
    if (newBrand.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio.' });
    }

    newBrand.id = getNextId('produtoMarca');
    database.produtoMarca.push(newBrand);
    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar dados.');
        } else {
            res.status(201).json(newBrand);
        }
    });
});

app.put('/brand/:id', (req, res) => {
    const brandId = parseInt(req.params.id);
    const updateBrand = req.body;
    const index = database.produtoMarca.findIndex(brand => brand.id === brandId);

    if (updateBrand.nome == null) {
        return res.status(400).send({ error: 'Nome não informado.' });
    }
    if (updateBrand.descricao == null) {
        return res.status(400).send({ error: 'Descrição não informado.' });
    }

    //verificando se os atributos não estão vazios
    if (updateBrand.nome.length === 0) {
        return res.status(400).send({ error: 'Nome não pode ser vazio.' });
    }
    if (updateBrand.descricao.length === 0) {
        return res.status(400).send({ error: 'Descrição não pode ser vazio.' });
    }

    if (index !== -1) {
        database.produtoMarca[index] = { ...database.produtoMarca[index], ...updateBrand };
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).json(updateBrand);
            }
        });
    } else {
        res.status(404).send('Marca não encontrada.');
    }
});

app.delete('/brand/:id', (req, res) => {
    const brandId = parseInt(req.params.id);
    const index = database.produtoMarca.findIndex(brand => brand.id === brandId);

    if (index !== -1) {
        database.produtoMarca.splice(index, 1);
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar dados.');
            } else {
                res.status(201).send('Marca deletada.');
            }
        });
    } else {
        res.status(404).send('Marca não encontrada.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 