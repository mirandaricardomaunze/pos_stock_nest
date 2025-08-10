import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order-dto';
import { OrderGateway } from './orderWebSocket/order.getway';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private orderGetway: OrderGateway,
  ) {}

  async create(
    { employeeId, paymentMethod, items, notes, clientName }: CreateOrderDto,
    userId: number,
    companyId: number,
  ): Promise<Order> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Funcionário não encontrado');
    }

    const orderItems = await this.validateAndPrepareItems(items, companyId);

    const order = await this.prisma.order.create({
      data: {
        employeeId,
        clientName,
        paymentMethod,
        notes,
        status: OrderStatus.PENDING,
        items: { create: orderItems },
      },
      include: this.orderIncludes(),
    });

    await this.decrementStock(orderItems, companyId);

    this.eventEmitter.emit('order.created', order);
    this.orderGetway.emitOrderCreated(order);

    const productIds = items.map((item) => item.productId);
    const productsUpdated = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
    });

    await this.prisma.movement.create({
      data: {
        type: 'Order',
        entityType: 'Product',
        entityId: order.id,
        description: `Pedido #${order.id} criado para ${clientName || 'cliente não identificado'}`,
        clientName,
        amountPaid: order.items.reduce((total, item) => total + item.quantity * item.price, 0),
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } },
        details: items.map((item) => {
          const product = productsUpdated.find((p) => p.id === item.productId);
          return {
            name: product?.name || '',
            quantity: item.quantity,
            price: product?.sellingPrice || 0,
          };
        }),
      },
    });

    return order;
  }

  async findAll(companyId: number, status?: OrderStatus): Promise<any[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        ...(status && { status }),
        employee: {
          companyId,
        },
      },
      include: this.orderIncludes(),
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  }

  async findOneByCompany(id: number, companyId: number): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: {
        id,
        employee: {
          companyId,
        },
      },
      include: this.orderIncludes(),
    });
  }

  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data,
      include: this.orderIncludes(),
    });

    this.eventEmitter.emit('order.updated', order);
    this.orderGetway.emitOrderUpdated(order);
    return order;
  }

  async remove(id: number): Promise<Order> {
    return this.prisma.order.delete({ where: { id } });
  }

  async startProcessing(id: number): Promise<any> {
    const order = await this.update(id, { status: OrderStatus.IN_PROGRESS });
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  async completeOrder(id: number): Promise<any> {
    const order = await this.update(id, { status: OrderStatus.COMPLETED });
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private async validateAndPrepareItems(
    items: { productId: number; quantity: number }[],
    companyId: number,
  ) {
    return Promise.all(
      items.map(async ({ productId, quantity }) => {
        const product = await this.prisma.product.findFirst({
          where: { id: productId, companyId },
        });

        if (!product || product.quantity < quantity) {
          throw new Error(`Estoque insuficiente para o produto ID ${productId}`);
        }

        return {
          productId,
          quantity,
          price: product.sellingPrice,
        };
      }),
    );
  }

  private async decrementStock(
    items: { productId: number; quantity: number }[],
    companyId: number,
  ) {
    return Promise.all(
      items.map((item) =>
        this.prisma.product.updateMany({
          where: {
            id: item.productId,
            companyId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );
  }

  private orderIncludes() {
    return {
      items: { include: { product: true } },
      employee: true,
    };
  }

  async getRecentOrders(companyId: number) {
    const orders= await this.prisma.order.findMany({
      where: {
        employee: {
          companyId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  }

  async getOrdersByDate(
  companyId: number,
  startDate: string,
  endDate: string,
){
  const orders = await this.prisma.order.findMany({
    where: {
      employee: {
        companyId,
      },
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: this.orderIncludes(),
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
}

  
}
