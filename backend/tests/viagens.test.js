const request = require('supertest');
const { app, server } = require('../index');
const pool = require('../config/db');

describe('Endpoints de Viagens (Milhas - Protegidos)', () => {
  let token;

  beforeAll(async () => {
    const testUser = {
      nome: 'Utilizador Viagens',
      email: `viagens-${Date.now()}@exemplo.com`,
      senha: 'password123',
    };
    await request(app).post('/cadastro').send(testUser);
    const loginRes = await request(app)
      .post('/login')
      .send({ email: testUser.email, senha: testUser.senha });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  describe('/api/milhas/carteiras', () => {
    let carteiraId;

    it('deve criar uma nova carteira de milhas com sucesso', async () => {
      const novaCarteira = {
        name: 'LATAM Pass',
        balance: 50000,
        avgCpm: 18.5,
        expiration: '2026-12-31',
        type: 'Nacional',
      };
      const res = await request(app)
        .post('/api/milhas/carteiras')
        .set('Authorization', `Bearer ${token}`)
        .send(novaCarteira);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(novaCarteira.name);
      carteiraId = res.body.id;
    });

    it('deve atualizar uma carteira de milhas existente', async () => {
      const dadosAtualizados = {
        name: 'LATAM Pass Gold',
        balance: 55000,
        avgCpm: 18.2,
        expiration: '2027-01-31',
        type: 'Nacional',
      };
      const res = await request(app)
        .put(`/api/milhas/carteiras/${carteiraId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dadosAtualizados);

      expect(res.statusCode).toEqual(200);
      expect(res.body.balance).toBe(dadosAtualizados.balance);
    });

    it('deve apagar uma carteira de milhas existente', async () => {
      const res = await request(app)
        .delete(`/api/milhas/carteiras/${carteiraId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(204);
    });
  });

  describe('/api/milhas/metas', () => {
    let metaId;

    it('deve criar uma nova meta de viagem com sucesso', async () => {
      const novaMeta = {
        nomeDestino: 'Viagem para Lisboa',
        origem: 'GRU',
        destino: 'LIS',
        programSuggestions: ['TAP Miles&Go'],
        flightCostBRL: 4500.0,
        estimatedMiles: 80000,
      };
      const res = await request(app)
        .post('/api/milhas/metas')
        .set('Authorization', `Bearer ${token}`)
        .send(novaMeta);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nomeDestino).toBe(novaMeta.nomeDestino);
      metaId = res.body.id;
    });

    it('deve atualizar uma meta de viagem existente', async () => {
      const dadosAtualizados = {
        nomeDestino: 'Viagem para Porto',
        origem: 'GRU',
        destino: 'OPO',
        programSuggestions: ['TAP Miles&Go'],
        flightCostBRL: 4800.0,
        estimatedMiles: 85000,
      };
      const res = await request(app)
        .put(`/api/milhas/metas/${metaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dadosAtualizados);

      expect(res.statusCode).toEqual(200);
      expect(res.body.destino).toBe(dadosAtualizados.destino);
    });

    it('deve apagar uma meta de viagem existente', async () => {
      const res = await request(app)
        .delete(`/api/milhas/metas/${metaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(204);
    });
  });
});
