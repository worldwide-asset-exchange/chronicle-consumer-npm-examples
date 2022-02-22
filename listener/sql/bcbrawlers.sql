CREATE TYPE bcbrawlers_actions AS ENUM (
  'gearadd'   
  'gearrem'    
  'brawleradd'    
  'brawlerrem'    
  'ringselect'    
  'brawl'    
  'receiverand'      
  'heal'    
  'wdrawbrawler'    
  'craft'    
  'wdrawbrwl'    
  'configset'    
  'configclear'      
  'maintset'    
  'brawlerset'    
  'gearset'    
  'ringset'    
  'ringdset'    
  'slotdset'    
  'brawlerdel'    
  'geardel'    
  'ringdel'    
  'ringddel'    
  'slotddel'    
  'recset'    
);

CREATE TABLE public.bcbrawlers (
        id serial NOT NULL,
        action bcbrawlers_actions,
        brawler_id int,  
        gear_id bigint,
        slot_id bigint,
        ring_id bigint,
        owner text NOT NULL,  
        extradata jsonb NULL,
        executiontime timestamp NOT NULL,
        blocknumber bigint,
        txn_id text NOT NULL
);
