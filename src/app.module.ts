import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { SupplierModule } from './supplier/supplier.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SalesController } from './sales/sales.controller';
import { SaleService } from './sales/sales.service';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { NotificationsGateway } from './notificationWebsocket/notifications.gateway';
import { MovementService } from './movements/movements.service';
import { MovementController } from './movements/movements.controller';
import { MovementsModule } from './movements/movements.module';
import { StockCheckModule } from './stock-check/stock-check.module';
import { StockCheckService } from './stock-check/stock-check.service';
import { SettingsService } from './settings/settings.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsModule } from './settings/settings.module';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeModule } from './employee/employee.module';
import { CustomerService } from './customer/customer.service';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { CompanyService } from './company/company.service';
import { CompanyController } from './company/company.controller';
import { CompanyModule } from './company/company.module';
import { ReturnService } from './return/return.service';
import { ReturnController } from './return/return.controller';
import { ReturnModule } from './return/return.module';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderModule } from './order/order.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrderGateway } from './order/orderWebSocket/order.getway';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { VacationService } from './vacation/vacation.service';
import { VacationController } from './vacation/vacation.controller';
import { VacationModule } from './vacation/vacation.module';
import { PayrollModule } from './payroll/payroll.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [EventEmitterModule.forRoot(),
    UsersModule, ProductsModule, SalesModule, InventoryModule, SalesModule, PrismaModule, AuthModule, CategoryModule, SupplierModule, DashboardModule, NotificationModule, MovementsModule, StockCheckModule, SettingsModule, EmployeeModule, CustomerModule, CompanyModule, ReturnModule, OrderModule, AttendanceModule, VacationModule, PayrollModule, InvoiceModule],
  controllers: [AppController, SalesController, NotificationController, MovementController, SettingsController, EmployeeController, CustomerController, CompanyController, ReturnController, OrderController, AttendanceController, VacationController],
  providers: [AppService, UsersService, SaleService, PrismaService, NotificationService,NotificationsGateway, MovementService, StockCheckService, SettingsService, EmployeeService, CustomerService, CompanyService, ReturnService, OrderService,OrderGateway, AttendanceService, VacationService],
})
export class AppModule {}
