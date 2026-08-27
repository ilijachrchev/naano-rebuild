import type { Database } from "./database";

type ServerWriteOnlyTable =
  | "click_events"
  | "collaboration_deliverables"
  | "collaboration_events"
  | "collaboration_offers"
  | "collaborations"
  | "fund_holds"
  | "payouts"
  | "posts"
  | "tracking_links"
  | "wallet_transactions";

type ReadOnlyTable<Table> = Table extends {
  Insert: unknown;
  Update: unknown;
}
  ? Omit<Table, "Insert" | "Update"> & { Insert: never; Update: never }
  : Table;

type PublicSchema = Database["public"];

export type BrowserDatabase = Omit<Database, "public"> & {
  public: Omit<PublicSchema, "Tables"> & {
    Tables: {
      [Name in keyof PublicSchema["Tables"]]: Name extends ServerWriteOnlyTable
        ? ReadOnlyTable<PublicSchema["Tables"][Name]>
        : PublicSchema["Tables"][Name];
    };
  };
};
