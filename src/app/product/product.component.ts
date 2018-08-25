import { Component, OnInit } from '@angular/core';
import {Product, ProductService} from '../shared/product.service';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})


export class ProductComponent implements OnInit {
   products: Observable<Product[]>;
   imgUrl = 'http://placehold.it/320x150';

  constructor(private productService: ProductService) {

  }

  ngOnInit() {
    this.products = this.productService.getProducts();
    this.productService.searchEvent.subscribe(
      params => this.products = this.productService.search(params)

    );
  }

}

