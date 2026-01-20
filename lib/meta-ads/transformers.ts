/**
 * Transformers for Meta Ads API data
 *
 * Meta returns conversions and costs in complex nested structures.
 * These transformers convert Meta's format into flat, easy-to-use objects.
 *
 * @see https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats
 */

/**
 * Extract value from Meta's actions array by action type
 *
 * Example Meta response:
 * {
 *   actions: [
 *     { action_type: 'lead', value: '25' },
 *     { action_type: 'purchase', value: '8' }
 *   ]
 * }
 *
 * @param actions - Array of action objects
 * @param actionType - Type of action to extract (e.g., 'lead', 'purchase', 'link_click')
 * @returns Numeric value or 0 if not found
 */
export function extractActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions || !Array.isArray(actions)) {
    return 0;
  }

  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) || 0 : 0;
}

/**
 * Extract multiple action values and sum them
 *
 * Useful for extracting total conversions across different types.
 *
 * @param actions - Array of action objects
 * @param actionTypes - Array of action types to sum
 * @returns Total sum of all matching action types
 */
export function extractTotalActions(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionTypes: string[]
): number {
  if (!actions || !Array.isArray(actions)) {
    return 0;
  }

  return actionTypes.reduce((sum, type) => {
    return sum + extractActionValue(actions, type);
  }, 0);
}

/**
 * Extract cost per action from cost_per_action_type array
 *
 * @param costPerActionType - Array of cost per action objects
 * @param actionType - Type of action (e.g., 'lead', 'purchase')
 * @returns Cost as string (preserving precision) or '0'
 */
export function extractCostPerAction(
  costPerActionType: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): string {
  if (!costPerActionType || !Array.isArray(costPerActionType)) {
    return '0';
  }

  const cost = costPerActionType.find((c) => c.action_type === actionType);
  return cost?.value || '0';
}

/**
 * Transform Meta campaign data to app format
 */
export function transformCampaign(metaCampaign: any, insights?: any) {
  const spend = insights?.spend || '0';
  const impressions = parseInt(insights?.impressions || '0', 10);
  const clicks = parseInt(insights?.clicks || '0', 10);
  const reach = parseInt(insights?.reach || '0', 10);
  const frequency = insights?.frequency || '0';

  // Extract conversions from actions
  const leads = extractActionValue(insights?.actions, 'lead');
  const purchases = extractActionValue(insights?.actions, 'purchase');
  const offlineConversions = extractActionValue(insights?.actions, 'offsite_conversion');
  const totalConversions = extractTotalActions(insights?.actions, [
    'lead',
    'purchase',
    'offsite_conversion',
    'omni_complete_registration',
    'onsite_conversion.post_save'
  ]);

  // Extract conversion values
  const conversionValue = insights?.action_values?.find((v: any) =>
    v.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Calculate performance metrics
  const ctr = insights?.ctr || '0';
  const cpc = insights?.cpc || '0';
  const cpm = insights?.cpm || '0';
  const cpp = insights?.cpp || '0'; // Cost per 1000 people reached
  const cpa = extractCostPerAction(insights?.cost_per_action_type, 'offsite_conversion');
  const roas = insights?.purchase_roas?.find((r: any) =>
    r.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  return {
    id: metaCampaign.id,
    campaignId: metaCampaign.id,
    name: metaCampaign.name,
    objective: metaCampaign.objective || 'UNKNOWN',
    status: metaCampaign.status,
    dailyBudget: metaCampaign.daily_budget || null,
    lifetimeBudget: metaCampaign.lifetime_budget || null,
    spend,
    impressions,
    clicks,
    reach,
    frequency,
    leads,
    purchases,
    conversions: totalConversions.toString(),
    conversionValue,
    ctr,
    cpc,
    cpm,
    cpp,
    cpa,
    roas,
    createdTime: metaCampaign.created_time,
    updatedTime: metaCampaign.updated_time,
  };
}

/**
 * Transform Meta ad set data to app format
 */
export function transformAdSet(metaAdSet: any, insights?: any) {
  const spend = insights?.spend || '0';
  const impressions = parseInt(insights?.impressions || '0', 10);
  const clicks = parseInt(insights?.clicks || '0', 10);
  const reach = parseInt(insights?.reach || '0', 10);
  const frequency = insights?.frequency || '0';

  // Extract conversions
  const leads = extractActionValue(insights?.actions, 'lead');
  const purchases = extractActionValue(insights?.actions, 'purchase');
  const totalConversions = extractTotalActions(insights?.actions, [
    'lead',
    'purchase',
    'offsite_conversion'
  ]);

  // Performance metrics
  const ctr = insights?.ctr || '0';
  const cpc = insights?.cpc || '0';
  const cpm = insights?.cpm || '0';
  const cpa = extractCostPerAction(insights?.cost_per_action_type, 'offsite_conversion');

  return {
    id: metaAdSet.id,
    adSetId: metaAdSet.id,
    campaignId: metaAdSet.campaign_id,
    name: metaAdSet.name,
    status: metaAdSet.status,
    targeting: metaAdSet.targeting ? JSON.stringify(metaAdSet.targeting) : null,
    dailyBudget: metaAdSet.daily_budget || null,
    lifetimeBudget: metaAdSet.lifetime_budget || null,
    spend,
    impressions,
    clicks,
    reach,
    frequency,
    leads,
    purchases,
    conversions: totalConversions.toString(),
    ctr,
    cpc,
    cpm,
    cpa,
    createdTime: metaAdSet.created_time,
    updatedTime: metaAdSet.updated_time,
  };
}

/**
 * Transform Meta ad data to app format
 */
export function transformAd(metaAd: any, insights?: any) {
  const creative = metaAd.creative || {};
  const spend = insights?.spend || '0';
  const impressions = parseInt(insights?.impressions || '0', 10);
  const clicks = parseInt(insights?.clicks || '0', 10);
  const reach = parseInt(insights?.reach || '0', 10);

  // Extract conversions
  const leads = extractActionValue(insights?.actions, 'lead');
  const purchases = extractActionValue(insights?.actions, 'purchase');
  const totalConversions = extractTotalActions(insights?.actions, [
    'lead',
    'purchase',
    'offsite_conversion'
  ]);

  // Performance metrics
  const ctr = insights?.ctr || '0';
  const cpc = insights?.cpc || '0';
  const cpm = insights?.cpm || '0';
  const cpa = extractCostPerAction(insights?.cost_per_action_type, 'offsite_conversion');

  // Extract creative details
  const objectStorySpec = creative.object_story_spec || {};
  const linkData = objectStorySpec.link_data || {};
  const videoData = objectStorySpec.video_data || {};

  return {
    id: metaAd.id,
    adId: metaAd.id,
    adSetId: metaAd.adset_id,
    campaignId: metaAd.campaign_id,
    name: metaAd.name,
    status: metaAd.status,
    creativeId: creative.id || null,
    adFormat: creative.type || 'UNKNOWN',
    headline: linkData.name || videoData.title || creative.title || null,
    primaryText: linkData.message || creative.body || null,
    description: linkData.description || null,
    callToAction: creative.call_to_action_type || linkData.call_to_action?.type || null,
    thumbnailUrl: creative.thumbnail_url || creative.image_url || null,
    spend,
    impressions,
    clicks,
    reach,
    leads,
    purchases,
    conversions: totalConversions.toString(),
    ctr,
    cpc,
    cpm,
    cpa,
    createdTime: metaAd.created_time,
    updatedTime: metaAd.updated_time,
  };
}

/**
 * Transform Meta insights to daily metrics format
 */
export function transformDailyMetrics(insights: any) {
  const spend = insights.spend || '0';
  const impressions = parseInt(insights.impressions || '0', 10);
  const clicks = parseInt(insights.clicks || '0', 10);
  const reach = parseInt(insights.reach || '0', 10);
  const frequency = insights.frequency || '0';

  // Extract conversions
  const leads = extractActionValue(insights.actions, 'lead');
  const purchases = extractActionValue(insights.actions, 'purchase');
  const totalConversions = extractTotalActions(insights.actions, [
    'lead',
    'purchase',
    'offsite_conversion'
  ]);

  // Conversion value
  const conversionValue = insights.action_values?.find((v: any) =>
    v.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Performance metrics
  const ctr = insights.ctr || '0';
  const cpc = insights.cpc || '0';
  const cpm = insights.cpm || '0';
  const cpp = insights.cpp || '0';
  const cpa = extractCostPerAction(insights.cost_per_action_type, 'offsite_conversion');
  const roas = insights.purchase_roas?.find((r: any) =>
    r.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Engagement metrics
  const postEngagements = extractActionValue(insights.actions, 'post_engagement');
  const pageEngagements = extractActionValue(insights.actions, 'page_engagement');
  const linkClicks = extractActionValue(insights.actions, 'link_click');

  return {
    date: insights.date_start,
    spend,
    impressions,
    clicks,
    reach,
    frequency,
    leads,
    purchases,
    conversions: totalConversions.toString(),
    conversionValue,
    ctr,
    cpc,
    cpm,
    cpp,
    cpa,
    roas,
    postEngagements,
    pageEngagements,
    linkClicks,
  };
}

/**
 * Transform Meta insights to creative performance format (40+ metrics)
 */
export function transformCreativePerformance(ad: any, insights: any) {
  const spend = insights.spend || '0';
  const impressions = parseInt(insights.impressions || '0', 10);
  const clicks = parseInt(insights.clicks || '0', 10);
  const reach = parseInt(insights.reach || '0', 10);
  const frequency = insights.frequency || '0';

  // Engagement metrics
  const postEngagements = extractActionValue(insights.actions, 'post_engagement');
  const postReactions = extractActionValue(insights.actions, 'post_reaction');
  const postComments = extractActionValue(insights.actions, 'comment');
  const postShares = extractActionValue(insights.actions, 'post');
  const postSaves = extractActionValue(insights.actions, 'onsite_conversion.post_save');
  const photoViews = extractActionValue(insights.actions, 'photo_view');
  const linkClicks = extractActionValue(insights.actions, 'link_click');

  // Video metrics (only present for video ads)
  const videoViews = extractActionValue(insights.actions, 'video_view');
  const videoViewsP25 = extractActionValue(insights.video_p25_watched_actions, 'video_view');
  const videoViewsP50 = extractActionValue(insights.video_p50_watched_actions, 'video_view');
  const videoViewsP75 = extractActionValue(insights.video_p75_watched_actions, 'video_view');
  const videoViewsP95 = extractActionValue(insights.video_p95_watched_actions, 'video_view');
  const videoViewsP100 = extractActionValue(insights.video_p100_watched_actions, 'video_view');
  const videoAvgTimeWatched = insights.video_avg_time_watched_actions?.find((v: any) =>
    v.action_type === 'video_view'
  )?.value || '0';
  const videoThruPlays = extractActionValue(insights.actions, 'video_view');

  // Conversion metrics
  const leads = extractActionValue(insights.actions, 'lead');
  const purchases = extractActionValue(insights.actions, 'purchase');
  const addToCart = extractActionValue(insights.actions, 'add_to_cart');
  const checkoutInitiated = extractActionValue(insights.actions, 'initiate_checkout');
  const totalConversions = extractTotalActions(insights.actions, [
    'lead',
    'purchase',
    'offsite_conversion'
  ]);
  const conversionValue = insights.action_values?.find((v: any) =>
    v.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Cost metrics
  const ctr = insights.ctr || '0';
  const cpc = insights.cpc || '0';
  const cpm = insights.cpm || '0';
  const cpp = insights.cpp || '0';
  const cpa = extractCostPerAction(insights.cost_per_action_type, 'offsite_conversion');
  const costPerLead = extractCostPerAction(insights.cost_per_action_type, 'lead');
  const costPerPurchase = extractCostPerAction(insights.cost_per_action_type, 'purchase');
  const costPerVideoView = extractCostPerAction(insights.cost_per_action_type, 'video_view');
  const costPerThruPlay = extractCostPerAction(insights.cost_per_thruplay_type, 'video_view');
  const roas = insights.purchase_roas?.find((r: any) =>
    r.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Quality metrics
  const relevanceScore = insights.relevance_score?.score || null;
  const qualityRanking = insights.quality_ranking || null;
  const engagementRateRanking = insights.engagement_rate_ranking || null;
  const conversionRateRanking = insights.conversion_rate_ranking || null;

  return {
    adId: ad.id,
    creativeId: ad.creative?.id || ad.id,
    adFormat: ad.creative?.type || 'UNKNOWN',
    spend,
    impressions,
    clicks,
    reach,
    frequency,
    postEngagements,
    postReactions,
    postComments,
    postShares,
    postSaves,
    photoViews,
    linkClicks,
    videoViews: videoViews || null,
    videoViewsP25: videoViewsP25 || null,
    videoViewsP50: videoViewsP50 || null,
    videoViewsP75: videoViewsP75 || null,
    videoViewsP95: videoViewsP95 || null,
    videoViewsP100: videoViewsP100 || null,
    videoAvgTimeWatched,
    videoThruPlays: videoThruPlays || null,
    costPerVideoView: videoViews > 0 ? costPerVideoView : null,
    costPerThruPlay: videoThruPlays > 0 ? costPerThruPlay : null,
    leads,
    purchases,
    addToCart,
    checkoutInitiated,
    conversions: totalConversions.toString(),
    conversionValue,
    ctr,
    cpc,
    cpm,
    cpp,
    cpa,
    costPerLead: leads > 0 ? costPerLead : null,
    costPerPurchase: purchases > 0 ? costPerPurchase : null,
    roas,
    relevanceScore,
    qualityRanking,
    engagementRateRanking,
    conversionRateRanking,
  };
}

/**
 * Transform geographic insights
 */
export function transformGeoPerformance(insights: any) {
  const spend = insights.spend || '0';
  const impressions = parseInt(insights.impressions || '0', 10);
  const clicks = parseInt(insights.clicks || '0', 10);
  const reach = parseInt(insights.reach || '0', 10);

  // Extract conversions
  const leads = extractActionValue(insights.actions, 'lead');
  const purchases = extractActionValue(insights.actions, 'purchase');
  const totalConversions = extractTotalActions(insights.actions, [
    'lead',
    'purchase',
    'offsite_conversion'
  ]);
  const conversionValue = insights.action_values?.find((v: any) =>
    v.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';

  // Performance metrics
  const roas = insights.purchase_roas?.find((r: any) =>
    r.action_type === 'offsite_conversion.fb_pixel_purchase'
  )?.value || '0';
  const ctr = insights.ctr || '0';
  const cpa = extractCostPerAction(insights.cost_per_action_type, 'offsite_conversion');
  const cpc = insights.cpc || '0';

  return {
    countryCode: insights.country || 'UNKNOWN',
    countryName: insights.country || 'Unknown',
    region: insights.region || null,
    city: insights.dma || null,
    spend,
    impressions,
    clicks,
    reach,
    leads,
    purchases,
    conversions: totalConversions.toString(),
    conversionValue,
    roas,
    ctr,
    cpa,
    cpc,
  };
}
