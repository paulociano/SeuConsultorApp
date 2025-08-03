--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.atualizado_em = NOW();
      RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO devuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agenda_compromissos; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.agenda_compromissos (
    id integer NOT NULL,
    user_id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    data timestamp without time zone NOT NULL,
    local character varying(255),
    participantes text,
    link_reuniao character varying(500),
    descricao_detalhada text,
    status character varying(50) DEFAULT 'Marcado'::character varying NOT NULL,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.agenda_compromissos OWNER TO devuser;

--
-- Name: agenda_compromissos_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.agenda_compromissos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agenda_compromissos_id_seq OWNER TO devuser;

--
-- Name: agenda_compromissos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.agenda_compromissos_id_seq OWNED BY public.agenda_compromissos.id;


--
-- Name: aposentadoria_dados; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.aposentadoria_dados (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dados jsonb,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aposentadoria_dados OWNER TO devuser;

--
-- Name: aposentadoria_dados_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.aposentadoria_dados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aposentadoria_dados_id_seq OWNER TO devuser;

--
-- Name: aposentadoria_dados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.aposentadoria_dados_id_seq OWNED BY public.aposentadoria_dados.id;


--
-- Name: aquisicao_simulacoes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.aquisicao_simulacoes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tipo_bem character varying(20) NOT NULL,
    simulacoes jsonb,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aquisicao_simulacoes OWNER TO devuser;

--
-- Name: aquisicao_simulacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.aquisicao_simulacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aquisicao_simulacoes_id_seq OWNER TO devuser;

--
-- Name: aquisicao_simulacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.aquisicao_simulacoes_id_seq OWNED BY public.aquisicao_simulacoes.id;


--
-- Name: ativos; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.ativos (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    valor numeric(12,2) NOT NULL,
    tipo character varying(100),
    user_id integer NOT NULL
);


ALTER TABLE public.ativos OWNER TO devuser;

--
-- Name: ativos_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.ativos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ativos_id_seq OWNER TO devuser;

--
-- Name: ativos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.ativos_id_seq OWNED BY public.ativos.id;


--
-- Name: dividas; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.dividas (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    valor numeric(12,2) NOT NULL,
    tipo character varying(100),
    user_id integer NOT NULL
);


ALTER TABLE public.dividas OWNER TO devuser;

--
-- Name: dividas_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.dividas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dividas_id_seq OWNER to devuser;

--
-- Name: dividas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.dividas_id_seq OWNED BY public.dividas.id;


--
-- Name: milhas_carteiras; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.milhas_carteiras (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome character varying(100) NOT NULL,
    saldo integer DEFAULT 0 NOT NULL,
    cpm_medio numeric(10,2) DEFAULT 0.00 NOT NULL,
    data_expiracao date,
    tipo character varying(10) NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT milhas_carteiras_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['milha'::character varying, 'ponto'::character varying])::text[])))
);


ALTER TABLE public.milhas_carteiras OWNER to devuser;

--
-- Name: milhas_carteiras_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.milhas_carteiras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.milhas_carteiras_id_seq OWNER to devuser;

--
-- Name: milhas_carteiras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.milhas_carteiras_id_seq OWNED BY public.milhas_carteiras.id;


--
-- Name: milhas_metas; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.milhas_metas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome_destino character varying(255) NOT NULL,
    origem_sigla character varying(3),
    destino_sigla character varying(3),
    programa_alvo character varying(100),
    custo_reais numeric(10,2),
    custo_milhas integer,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);


ALTER TABLE public.milhas_metas OWNER to devuser;

--
-- Name: milhas_metas_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.milhas_metas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.milhas_metas_id_seq OWNER to devuser;

--
-- Name: milhas_metas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.milhas_metas_id_seq OWNED BY public.milhas_metas.id;


--
-- Name: objetivos; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.objetivos (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    icon character varying(50) NOT NULL,
    valor_alvo numeric(15,2) NOT NULL,
    aporte_mensal numeric(15,2) DEFAULT 0,
    investimentos_linkados integer[] DEFAULT ARRAY[]::integer[],
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.objetivos OWNER to devuser;

--
-- Name: objetivos_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.objetivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.objetivos_id_seq OWNER to devuser;

--
-- Name: objetivos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.objetivos_id_seq OWNED BY public.objetivos.id;


--
-- Name: orcamento_categorias; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.orcamento_categorias (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    tipo character varying(50) NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.orcamento_categorias OWNER to devuser;

--
-- Name: orcamento_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.orcamento_categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orcamento_categorias_id_seq OWNER to devuser;

--
-- Name: orcamento_categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.orcamento_categorias_id_seq OWNED BY public.orcamento_categorias.id;


--
-- Name: orcamento_itens; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.orcamento_itens (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    valor_planejado numeric(10,2) DEFAULT 0.00,
    valor_atual numeric(10,2) DEFAULT 0.00,
    categoria_id integer NOT NULL,
    user_id integer NOT NULL,
    categoria_planejamento character varying(50)
);


ALTER TABLE public.orcamento_itens OWNER to devuser;

--
-- Name: orcamento_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.orcamento_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orcamento_itens_id_seq OWNER to devuser;

--
-- Name: orcamento_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.orcamento_itens_id_seq OWNED BY public.orcamento_itens.id;


--
-- Name: protecao_despesas_futuras; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.protecao_despesas_futuras (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    ano_inicio integer NOT NULL,
    valor_mensal numeric(15,2) DEFAULT 0 NOT NULL,
    prazo_meses integer NOT NULL,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.protecao_despesas_futuras OWNER to devuser;

--
-- Name: protecao_despesas_futuras_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.protecao_despesas_futuras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protecao_despesas_futuras_id_seq OWNER to devuser;

--
-- Name: protecao_despesas_futuras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.protecao_despesas_futuras_id_seq OWNED BY public.protecao_despesas_futuras.id;


--
-- Name: protecao_invalidez; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.protecao_invalidez (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    cobertura numeric(15,2) DEFAULT 0 NOT NULL,
    observacoes text,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.protecao_invalidez OWNER to devuser;

--
-- Name: protecao_invalidez_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.protecao_invalidez_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protecao_invalidez_id_seq OWNER to devuser;

--
-- Name: protecao_invalidez_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.protecao_invalidez_id_seq OWNED BY public.protecao_invalidez.id;


--
-- Name: protecao_patrimonial; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.protecao_patrimonial (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    empresa character varying(255),
    data_vencimento date,
    valor numeric(15,2) DEFAULT 0 NOT NULL,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.protecao_patrimonial OWNER to devuser;

--
-- Name: protecao_patrimonial_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.protecao_patrimonial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protecao_patrimonial_id_seq OWNER to devuser;

--
-- Name: protecao_patrimonial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.protecao_patrimonial_id_seq OWNED BY public.protecao_patrimonial.id;


--
-- Name: reunioes_atas; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.reunioes_atas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    data_criacao timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    resumo text,
    participantes_presentes text,
    deliberacoes text,
    categoria_financeira character varying(100),
    tipo_decisao_financeira character varying(255),
    valor_envolvido numeric(15,2),
    impacto_esperado text,
    action_items jsonb,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reunioes_atas OWNER to devuser;

--
-- Name: reunioes_atas_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.reunioes_atas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reunioes_atas_id_seq OWNER to devuser;

--
-- Name: reunioes_atas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.reunioes_atas_id_seq OWNED BY public.reunioes_atas.id;


--
-- Name: simulador_pgbl_dados; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.simulador_pgbl_dados (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dados jsonb,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.simulador_pgbl_dados OWNER to devuser;

--
-- Name: simulador_pgbl_dados_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.simulador_pgbl_dados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.simulador_pgbl_dados_id_seq OWNER to devuser;

--
-- Name: simulador_pgbl_dados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.simulador_pgbl_dados_id_seq OWNED BY public.simulador_pgbl_dados.id;


--
-- Name: transacoes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.transacoes (
    id integer NOT NULL,
    descricao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    data date NOT NULL,
    tipo character varying(50) NOT NULL,
    categoria character varying(100),
    ignorada boolean DEFAULT false,
    user_id integer NOT NULL
);


ALTER TABLE public.transacoes OWNER to devuser;

--
-- Name: transacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.transacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transacoes_id_seq OWNER to devuser;

--
-- Name: transacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.transacoes_id_seq OWNED BY public.transacoes.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    imagem_url character varying(255),
    tour_orcamento_completo boolean DEFAULT false,
    tour_fluxo_caixa_completo boolean DEFAULT false,
    tour_planejamento_completo boolean DEFAULT false
);


ALTER TABLE public.usuarios OWNER to devuser;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER to devuser;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: agenda_compromissos id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.agenda_compromissos ALTER COLUMN id SET DEFAULT nextval('public.agenda_compromissos_id_seq'::regclass);


--
-- Name: aposentadoria_dados id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aposentadoria_dados ALTER COLUMN id SET DEFAULT nextval('public.aposentadoria_dados_id_seq'::regclass);


--
-- Name: aquisicao_simulacoes id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aquisicao_simulacoes ALTER COLUMN id SET DEFAULT nextval('public.aquisicao_simulacoes_id_seq'::regclass);


--
-- Name: ativos id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.ativos ALTER COLUMN id SET DEFAULT nextval('public.ativos_id_seq'::regclass);


--
-- Name: dividas id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.dividas ALTER COLUMN id SET DEFAULT nextval('public.dividas_id_seq'::regclass);


--
-- Name: milhas_carteiras id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_carteiras ALTER COLUMN id SET DEFAULT nextval('public.milhas_carteiras_id_seq'::regclass);


--
-- Name: milhas_metas id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_metas ALTER COLUMN id SET DEFAULT nextval('public.milhas_metas_id_seq'::regclass);


--
-- Name: objetivos id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.objetivos ALTER COLUMN id SET DEFAULT nextval('public.objetivos_id_seq'::regclass);


--
-- Name: orcamento_categorias id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_categorias ALTER COLUMN id SET DEFAULT nextval('public.orcamento_categorias_id_seq'::regclass);


--
-- Name: orcamento_itens id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_itens ALTER COLUMN id SET DEFAULT nextval('public.orcamento_itens_id_seq'::regclass);


--
-- Name: protecao_despesas_futuras id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_despesas_futuras ALTER COLUMN id SET DEFAULT nextval('public.protecao_despesas_futuras_id_seq'::regclass);


--
-- Name: protecao_invalidez id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_invalidez ALTER COLUMN id SET DEFAULT nextval('public.protecao_invalidez_id_seq'::regclass);


--
-- Name: protecao_patrimonial id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_patrimonial ALTER COLUMN id SET DEFAULT nextval('public.protecao_patrimonial_id_seq'::regclass);


--
-- Name: reunioes_atas id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.reunioes_atas ALTER COLUMN id SET DEFAULT nextval('public.reunioes_atas_id_seq'::regclass);


--
-- Name: simulador_pgbl_dados id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.simulador_pgbl_dados ALTER COLUMN id SET DEFAULT nextval('public.simulador_pgbl_dados_id_seq'::regclass);


--
-- Name: transacoes id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.transacoes ALTER COLUMN id SET DEFAULT nextval('public.transacoes_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: agenda_compromissos agenda_compromissos_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.agenda_compromissos
    ADD CONSTRAINT agenda_compromissos_pkey PRIMARY KEY (id);


--
-- Name: aposentadoria_dados aposentadoria_dados_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aposentadoria_dados
    ADD CONSTRAINT aposentadoria_dados_pkey PRIMARY KEY (id);


--
-- Name: aposentadoria_dados aposentadoria_dados_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aposentadoria_dados
    ADD CONSTRAINT aposentadoria_dados_user_id_key UNIQUE (user_id);


--
-- Name: aquisicao_simulacoes aquisicao_simulacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aquisicao_simulacoes
    ADD CONSTRAINT aquisicao_simulacoes_pkey PRIMARY KEY (id);


--
-- Name: aquisicao_simulacoes aquisicao_simulacoes_user_id_tipo_bem_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aquisicao_simulacoes
    ADD CONSTRAINT aquisicao_simulacoes_user_id_tipo_bem_key UNIQUE (user_id, tipo_bem);


--
-- Name: ativos ativos_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.ativos
    ADD CONSTRAINT ativos_pkey PRIMARY KEY (id);


--
-- Name: dividas dividas_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.dividas
    ADD CONSTRAINT dividas_pkey PRIMARY KEY (id);


--
-- Name: milhas_carteiras milhas_carteiras_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_carteiras
    ADD CONSTRAINT milhas_carteiras_pkey PRIMARY KEY (id);


--
-- Name: milhas_metas milhas_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_metas
    ADD CONSTRAINT milhas_metas_pkey PRIMARY KEY (id);


--
-- Name: objetivos objetivos_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.objetivos
    ADD CONSTRAINT objetivos_pkey PRIMARY KEY (id);


--
-- Name: orcamento_categorias orcamento_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_categorias
    ADD CONSTRAINT orcamento_categorias_pkey PRIMARY KEY (id);


--
-- Name: orcamento_itens orcamento_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_itens
    ADD CONSTRAINT orcamento_itens_pkey PRIMARY KEY (id);


--
-- Name: protecao_despesas_futuras protecao_despesas_futuras_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_despesas_futuras
    ADD CONSTRAINT protecao_despesas_futuras_pkey PRIMARY KEY (id);


--
-- Name: protecao_invalidez protecao_invalidez_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_invalidez
    ADD CONSTRAINT protecao_invalidez_pkey PRIMARY KEY (id);


--
-- Name: protecao_patrimonial protecao_patrimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_patrimonial
    ADD CONSTRAINT protecao_patrimonial_pkey PRIMARY KEY (id);


--
-- Name: reunioes_atas reunioes_atas_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.reunioes_atas
    ADD CONSTRAINT reunioes_atas_pkey PRIMARY KEY (id);


--
-- Name: simulador_pgbl_dados simulador_pgbl_dados_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.simulador_pgbl_dados
    ADD CONSTRAINT simulador_pgbl_dados_pkey PRIMARY KEY (id);


--
-- Name: simulador_pgbl_dados simulador_pgbl_dados_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.simulador_pgbl_dados
    ADD CONSTRAINT simulador_pgbl_dados_user_id_key UNIQUE (user_id);


--
-- Name: transacoes transacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT transacoes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_objetivos_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_objetivos_user_id ON public.objetivos USING btree (user_id);


--
-- Name: agenda_compromissos set_timestamp; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.agenda_compromissos FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: reunioes_atas set_timestamp; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.reunioes_atas FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: agenda_compromissos agenda_compromissos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.agenda_compromissos
    ADD CONSTRAINT agenda_compromissos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: aposentadoria_dados aposentadoria_dados_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aposentadoria_dados
    ADD CONSTRAINT aposentadoria_dados_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: aquisicao_simulacoes aquisicao_simulacoes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.aquisicao_simulacoes
    ADD CONSTRAINT aquisicao_simulacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: ativos ativos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.ativos
    ADD CONSTRAINT ativos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: dividas dividas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.dividas
    ADD CONSTRAINT dividas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: milhas_carteiras milhas_carteiras_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_carteiras
    ADD CONSTRAINT milhas_carteiras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: milhas_metas milhas_metas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.milhas_metas
    ADD CONSTRAINT milhas_metas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: objetivos objetivos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.objetivos
    ADD CONSTRAINT objetivos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: orcamento_categorias orcamento_categorias_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_categorias
    ADD CONSTRAINT orcamento_categorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: orcamento_itens orcamento_itens_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_itens
    ADD CONSTRAINT orcamento_itens_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.orcamento_categorias(id) ON DELETE CASCADE;


--
-- Name: orcamento_itens orcamento_itens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orcamento_itens
    ADD CONSTRAINT orcamento_itens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: protecao_despesas_futuras protecao_despesas_futuras_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_despesas_futuras
    ADD CONSTRAINT protecao_despesas_futuras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: protecao_invalidez protecao_invalidez_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_invalidez
    ADD CONSTRAINT protecao_invalidez_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: protecao_patrimonial protecao_patrimonial_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.protecao_patrimonial
    ADD CONSTRAINT protecao_patrimonial_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: reunioes_atas reunioes_atas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.reunioes_atas
    ADD CONSTRAINT reunioes_atas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: simulador_pgbl_dados simulador_pgbl_dados_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.simulador_pgbl_dados
    ADD CONSTRAINT simulador_pgbl_dados_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: transacoes transacoes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT transacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

