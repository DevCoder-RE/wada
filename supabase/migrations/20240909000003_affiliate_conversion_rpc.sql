-- RPC to record an affiliate conversion and atomically update the parent link,
-- mirroring track_affiliate_click(). SECURITY DEFINER so the counter update and
-- conversion insert work under RLS (clients have read-only policies on these tables).

CREATE OR REPLACE FUNCTION record_affiliate_conversion(
    affiliate_uuid UUID,
    commission NUMERIC,
    click_uuid UUID DEFAULT NULL,
    user_uuid UUID DEFAULT NULL,
    order_text TEXT DEFAULT NULL,
    currency_text TEXT DEFAULT 'USD',
    status_text TEXT DEFAULT 'pending'
)
RETURNS affiliate_conversions AS $$
DECLARE
    created affiliate_conversions%ROWTYPE;
BEGIN
    INSERT INTO affiliate_conversions (
        affiliate_link_id, click_id, user_id, order_id,
        commission_amount, currency, status
    ) VALUES (
        affiliate_uuid, click_uuid, user_uuid, order_text,
        commission, currency_text, status_text
    )
    RETURNING * INTO created;

    UPDATE affiliate_links
    SET conversion_count = conversion_count + 1,
        total_revenue = total_revenue + commission
    WHERE id = affiliate_uuid;

    RETURN created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;