from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Warehouse, Inventory, StockIn, StockOut, InventoryHistory
from apps.products.serializers import ProductSerializer

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class WarehouseSerializer(serializers.ModelSerializer):
    """仓库序列化器"""
    manager_info = UserSimpleSerializer(source='manager', read_only=True)

    class Meta:
        model = Warehouse
        fields = [
            'id', 'warehouse_code', 'warehouse_name', 'location',
            'manager', 'manager_info', 'contact_phone', 'remark',
            'status', 'created_at', 'updated_at'
        ]


class InventorySerializer(serializers.ModelSerializer):
    """库存序列化器"""
    warehouse_info = WarehouseSerializer(source='warehouse', read_only=True)
    product_info = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'warehouse', 'warehouse_info', 'product', 'product_info',
            'batch_code', 'quantity', 'unit_cost', 'created_at', 'updated_at'
        ]
        read_only_fields = ['batch_code']  # 批次编号由系统生成


class StockInSerializer(serializers.ModelSerializer):
    """入库记录序列化器"""
    warehouse_info = WarehouseSerializer(source='warehouse', read_only=True)
    product_info = ProductSerializer(source='product', read_only=True)
    operator_info = UserSimpleSerializer(source='operator', read_only=True)
    stock_in_type_display = serializers.CharField(source='get_stock_in_type_display', read_only=True)

    class Meta:
        model = StockIn
        fields = [
            'id', 'stock_in_code', 'warehouse', 'warehouse_info',
            'product', 'product_info', 'inventory', 'stock_in_type',
            'stock_in_type_display', 'quantity', 'unit_cost',
            'source_order', 'operator', 'operator_info', 'remark',
            'stock_in_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['stock_in_code', 'inventory']  # 入库单号由系统生成，库存批次在保存时创建


class StockOutSerializer(serializers.ModelSerializer):
    """出库记录序列化器"""
    warehouse_info = WarehouseSerializer(source='warehouse', read_only=True)
    product_info = ProductSerializer(source='product', read_only=True)
    operator_info = UserSimpleSerializer(source='operator', read_only=True)
    stock_out_type_display = serializers.CharField(source='get_stock_out_type_display', read_only=True)

    class Meta:
        model = StockOut
        fields = [
            'id', 'stock_out_code', 'warehouse', 'warehouse_info',
            'product', 'product_info', 'inventory', 'stock_out_type',
            'stock_out_type_display', 'quantity', 'related_order',
            'operator', 'operator_info', 'remark', 'stock_out_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['stock_out_code']  # 出库单号由系统生成


class InventoryHistorySerializer(serializers.ModelSerializer):
    """库存变化明细序列化器"""
    warehouse_name = serializers.CharField(source='warehouse.warehouse_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    sku = serializers.CharField(source='product.code', read_only=True)
    unit = serializers.CharField(source='product.unit', read_only=True)
    operator_name = serializers.CharField(source='operator.username', read_only=True)
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)

    class Meta:
        model = InventoryHistory
        fields = [
            'id', 'warehouse_id', 'warehouse_name', 'product_id', 'product_name',
            'sku', 'operation_type', 'operation_type_display', 'quantity',
            'before_quantity', 'after_quantity', 'unit', 'operator', 'operator_name',
            'operation_time', 'remark', 'source_type', 'source_type_display',
            'source_id', 'source_number'
        ]
        read_only_fields = fields 