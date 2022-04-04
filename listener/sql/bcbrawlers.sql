DROP TYPE IF EXISTS bcbrawlers_actions CASCADE;
CREATE TYPE bcbrawlers_actions AS ENUM (
  'tosaccept',
  'gearadd',
  'gearrem',
  'brawleradd',
  'brawlerrem',
  'ringselect',
  'brawl',
  'heal',
  'wdrawbrawler',
  'wdrawbrwl',
  'craft',
  'craftclaim',
  'receiverand',
  'logbrawl',
  'logheal', 
  'logcraft'
);

DROP TABLE IF EXISTS public.bcbrawlers;
CREATE TABLE public.bcbrawlers (
        id bigserial NOT NULL,
        action bcbrawlers_actions,
        brawler_id bigint,  
        gear_id bigint,
        slot_id bigint,
        ring_id bigint,
        owner text NULL,  
        extradata jsonb NULL,
        executiontime timestamp NOT NULL,
        blocknumber bigint,
        txn_id text NOT NULL
);