import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product } from './product.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(title: string, desc: string, price: number) {
    const prodId = Math.random().toString();
    const newProduct = new this.productModel({
      title: title,
      description: desc,
      price: price,
    });
    const result = await newProduct.save();
    return result.id as string;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();
    console.log(products);

    return products.map((prod) => {
      return {
        id: prod.id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
      };
    });
  }

  async getSingleProduct(productId: string) {
    const product = await this.findProduct(productId);
    console.log('Single Product');
    console.log(product);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    productId: string,
    title: string,
    desc: string,
    price: number,
  ) {
    const updatedProduct = await this.findProduct(productId);

    if (title) {
      updatedProduct.title = title;
    }
    if (desc) {
      updatedProduct.description = desc;
    }
    if (price) {
      updatedProduct.price = price;
    }
    updatedProduct.save();
  }

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.productModel.findById(id).exec();
      console.log(product);
    } catch (error) {
      throw new NotFoundException(
        'Cound not find product. Invalid product id.',
      );
    }

    if (!product) {
      throw new NotFoundException('Cound not find product.');
    }
    return product;
  }

  async deleteProduct(prodId: string) {
    const result = await this.productModel.deleteOne({ _id: prodId }).exec();
    console.log(result);
    if (result.deletedCount === 0) {
      throw new NotFoundException('Could not find product to delete.');
    }
  }
}
