import { db } from "../db";
import { sql } from "drizzle-orm";

async function verifyTables() {
  try {
    // Check if Meta Ads tables exist
    const result = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE 'meta_ads%'
      ORDER BY tablename;
    `);

    console.log("Meta Ads tables in database:");
    console.log("================================");

    if (result.rows.length === 0) {
      console.log("❌ No Meta Ads tables found!");
    } else {
      console.log(`✅ Found ${result.rows.length} Meta Ads tables:`);
      result.rows.forEach((row: any, index: number) => {
        console.log(`  ${index + 1}. ${row.tablename}`);
      });
    }

    // Check for each expected table
    const expectedTables = [
      "meta_ads_account",
      "meta_ads_account_snapshots",
      "meta_ads_activity_log",
      "meta_ads_cached_ad_sets",
      "meta_ads_cached_ads",
      "meta_ads_cached_campaigns",
      "meta_ads_cached_creative_performance",
      "meta_ads_cached_daily_metrics",
      "meta_ads_cached_frequency_analysis",
      "meta_ads_cached_funnel_data",
      "meta_ads_cached_geo_performance",
      "meta_ads_user_settings",
    ];

    const existingTables = result.rows.map((row: any) => row.tablename);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log("\n❌ Missing tables:");
      missingTables.forEach((table) => console.log(`  - ${table}`));
    } else {
      console.log("\n✅ All 12 Meta Ads tables are present!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error verifying tables:", error);
    process.exit(1);
  }
}

verifyTables();
