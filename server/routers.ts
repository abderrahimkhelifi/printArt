import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Orders Router
  orders: router({
    // Create a new order (public)
    create: publicProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientPhone: z.string().min(1),
        clientEmail: z.string().email(),
        serviceType: z.string().min(1),
        description: z.string().min(1),
        deadline: z.date().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const order = await db.createOrder({
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          clientEmail: input.clientEmail,
          serviceType: input.serviceType,
          description: input.description,
          deadline: input.deadline,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          status: "new",
        });

        // Create notification for new order
        if (order && typeof order === 'object' && 'insertId' in order) {
          await db.createNotification({
            type: "new_order",
            title: "طلب جديد",
            content: `تم استقبال طلب جديد من ${input.clientName} للخدمة: ${input.serviceType}`,
            orderId: order.insertId as number,
          });
        }

        return order;
      }),

    // Get all orders (admin only)
    list: adminProcedure.query(async () => {
      return await db.getOrders();
    }),

    // Get single order (admin only)
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),

    // Update order status (admin only)
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "pending_approval", "approved", "in_progress", "completed", "delayed", "cancelled"]),
        progress: z.number().optional(),
        estimatedPrice: z.number().optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateOrderStatus(input.id, input.status, input.adminNotes, input.progress, input.estimatedPrice);

        // Create notification for status change
        const statusLabels: Record<string, string> = {
          new: "جديد",
          pending_approval: "في انتظار الموافقة",
          approved: "موافق عليه",
          in_progress: "قيد التنفيذ",
          completed: "مكتمل",
          delayed: "مؤجل",
          cancelled: "ملغى",
        };

        await db.createNotification({
          type: "order_status_change",
          title: "تحديث حالة الطلب",
          content: `تم تحديث حالة الطلب إلى: ${statusLabels[input.status]}`,
          orderId: input.id,
        });
        return result;
      }),

    // Mark order as read (admin only)
    markAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markOrderAsRead(input.id);
      }),
  }),

  // Categories Router
  portfolio: router({
    // Get all portfolio works (public)
    list: publicProcedure.query(async () => {
      return await db.getPortfolioWorks();
    }),

    // Create portfolio work (admin only)
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        categoryId: z.number().min(1),
        price: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPortfolioWork({
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          categoryId: input.categoryId,
          price: input.price,
        });
      }),

    // Delete portfolio work (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePortfolioWork(input.id);
      }),

    // Update portfolio work (admin only)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePortfolioWork(id, data);
      }),
  }),

  // Services Router
  services: router({
    // Get all active services (public)
    list: publicProcedure.query(async () => {
      return await db.getServices();
    }),

    // Create service (admin only)
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        basePrice: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createService({
          name: input.name,
          description: input.description,
          basePrice: input.basePrice,
          isActive: 1,
        });
      }),

    // Update service (admin only)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        basePrice: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateService(id, data);
      }),

    // Toggle service active status (admin only)
    toggleActive: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.toggleServiceActive(input.id);
      }),
  }),

  // Notifications Router
  notifications: router({
    // Get all notifications (admin only)
    list: adminProcedure.query(async () => {
      return await db.getNotifications();
    }),

    // Mark notification as read (admin only)
    markAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markOrderAsRead(input.id);
      }),
  }),

  // Categories Router
  categories: router({
    // Get all categories (public)
    list: publicProcedure.query(async () => {
      return await db.getCategories();
    }),

    // Create category (admin only)
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCategory({
          name: input.name,
          description: input.description,
        });
      }),

    // Update category (admin only)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateCategory(id, data);
      }),

    // Delete category (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCategory(input.id);
      }),
  }),

  // Settings Router
  settings: router({
    // Get all settings (admin only)
    list: adminProcedure.query(async () => {
      return await db.getAllSettings();
    }),

    // Get single setting (public for frontend display)
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSetting(input.key);
      }),

    // Update setting (admin only)
    update: adminProcedure
      .input(z.object({
        key: z.string().min(1),
        value: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await db.updateSetting(input.key, input.value);
      }),

    // Delete setting (admin only)
    delete: adminProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        return await db.deleteSetting(input.key);
      }),
  }),
});

export type AppRouter = typeof appRouter;
