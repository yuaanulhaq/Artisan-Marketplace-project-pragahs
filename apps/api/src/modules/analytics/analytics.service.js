import { db } from "../../db/index.js";

export const getArtisanAnalytics = (artisanId) => {
  const summary = db
    .prepare(`
      SELECT
        COUNT(DISTINCT p.id) AS product_count,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
        COUNT(DISTINCT oi.order_id) AS order_count,
        COALESCE(SUM(p.view_count), 0) AS views
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE p.artisan_id = ? AND (o.status IS NULL OR o.status != 'cancelled')
    `)
    .get(artisanId);

  const topProducts = db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.view_count,
        COALESCE(SUM(oi.quantity), 0) AS units_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE p.artisan_id = ? AND (o.status IS NULL OR o.status != 'cancelled')
      GROUP BY p.id
      ORDER BY revenue DESC, p.view_count DESC
      LIMIT 5
    `)
    .all(artisanId)
    .map((product) => ({
      id: product.id,
      name: product.name,
      viewCount: Number(product.view_count),
      unitsSold: Number(product.units_sold),
      revenue: Number(product.revenue)
    }));

  const monthlySales = db
    .prepare(`
      SELECT
        substr(o.created_at, 1, 7) AS month,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.artisan_id = ? AND o.status != 'cancelled'
      GROUP BY substr(o.created_at, 1, 7)
      ORDER BY month DESC
      LIMIT 6
    `)
    .all(artisanId)
    .reverse()
    .map((row) => ({
      month: row.month,
      revenue: Number(row.revenue)
    }));

  return {
    summary: {
      productCount: Number(summary.product_count || 0),
      revenue: Number(summary.revenue || 0),
      orderCount: Number(summary.order_count || 0),
      views: Number(summary.views || 0)
    },
    topProducts,
    monthlySales
  };
};

