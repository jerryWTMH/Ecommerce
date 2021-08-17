<template>
  <div>
    <loading :active.sync="isLoading"></loading>
    <div class="row mt-4">
      <div class="col-md-4 mb-4" v-for="item in products" :key="item.id">
        <div class="card border-0 shadow-sm">
          <div
            style="
              height: 150px;
              background-size: cover;
              background-position: center;
            "
            :style="{ backgroundImage: `url(${item.imageUrl})` }"
          ></div>
          <div class="card-body">
            <span class="badge badge-secondary float-right ml-2">分類</span>
            <h5 class="card-title">
              <a href="#" class="text-dark">{{ item.title }}</a>
            </h5>
            <p class="card-text">{{ item.content }}</p>
            <div class="d-flex justify-content-between align-items-baseline">
              <!-- <div class="h5">2,800 元</div> -->
              <div class="h5" v-if="!item.price">
                原價 {{ item.origin_price }}
              </div>
              <del class="h6" v-if="item.price"
                >原價 {{ item.origin_price }}</del
              >
              <div class="h5" v-if="item.price">特價 {{ item.price }}</div>
            </div>
          </div>
          <div class="card-footer d-flex">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="getProduct(item.id)"
            >
              <i
                class="fas fa-spinner fa-spin"
                v-if="status.loadingItem === item.id"
              ></i>
              查看更多
            </button>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm ml-auto"
              @click="addToCart(item.id)"
            >
              <i
                class="fas fa-spinner fa-spin"
                v-if="status.loadingItem === item.id"
              ></i>
              加到購物車
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 產品列表卡片modal -->
    <div
      class="modal fade"
      id="productModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              {{ product.title }}
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <img :src="product.imageUrl" class="img-fluid" alt />
            <blockquote class="blockquote mt-3">
              <p class="mb-0">{{ product.content }}</p>
              <footer class="blockquote-footer text-right">
                {{ product.description }}
              </footer>
            </blockquote>
            <div class="d-flex justify-content-between align-items-baseline">
              <del class="h6">原價 {{ product.origin_price }}</del>
              <div class="h5">現在只要 {{ product.price }}</div>
            </div>
            <select class="form-control mt-3" v-model="product.num">
              <option :value="num" v-for="num in 10" :key="num">
                選購 {{ num }} {{ product.unit }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <div class="text-muted text-nowrap mr-3">
              小計
              <strong>{{ product.num * product.price }}</strong> 元
            </div>
            <button
              type="button"
              class="btn btn-primary"
              @click="addToCart(product.id, product.num)"
            >
              加到購物車
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Order -->
    <div>
      <table class="table mt-4">
        <thead>
          <tr>
            <th width="10"></th>
            <th width="10">Item</th>
            <th width="10">Qty</th>
            <th width="10">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in carts.carts" :key="item.id">
            <td>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="removeCartItem(item.id)"
              >
                <i class="far fa-trash-alt"></i>
              </button>
            </td>
            <td class="align-middle">
              {{ item.product.title }}
              <div class="text-success" v-if="item.coupon">已套用優惠券</div>
            </td>
            <td class="text-right">{{ item.qty }}</td>
            <td class="text-right">
              {{ item.qty * item.product.price | currency }}
              {{ item.qty * item.product.origin_price | currency }}
            </td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th colspan="3" class="text-right">Total</th>
            <th colspan="3" class="text-right">{{ carts.total | currency}}</th>
          </tr>
        </thead>
        <thead>
          <tr v-if="carts.final_total !== carts.total">
            <th colspan="3" class="text-right text-success">折扣價</th>
            <th colspan="3" class="text-right">{{ carts.final_total | currency }}</th>
          </tr>
        </thead>
      </table>
    </div>
    <!-- Coupon -->
    <div class="input-group mb-3 w-50 justify-content-center">
      <input
        type="text"
        class="form-control"
        placeholder="請輸入優換券"
        aria-label="請輸入優換券"
        aria-describedby="button-addon2"
        v-model="coupon_code"
      />
      <div class="input-group-append">
        <button
          class="btn btn-outline-secondary"
          type="button"
          id="button-addon2"
          @click="addCouponCode"
        >
          套用優換券
        </button>
      </div>
    </div>
    <!-- Form -->
    <div class="my-5 row justify-content-center">
        <validation-observer v-slot="{invalid}">
          <form class="col-md-12" @submit.prevent="createOrder">
            <validation-provider rules="required|email" v-slot="{errors, classes}">
              <div class="form-group">
                <!-- 輸入框 -->
                <label for="email">Email</label>
                <input id="email" type="email" name="email" v-model="form.user.email"
                    class="form-control" :class="classes">
                <!-- 錯誤訊息 以下為slot-->
                <span class="invalid-feedback">{{errors[0]}}</span>
              </div>            
            </validation-provider>

            <validation-provider rules="required" v-slot="{errors, classes}">
              <div class="form-group">
                <!-- 輸入框 -->
                <label for="username">Name</label>
                <input id="username" type="text" name="name" v-model="form.user.name"
                    class="form-control" :class="classes">
                <!-- 錯誤訊息 以下為slot-->
                <span class="invalid-feedback">{{errors[0]}}</span>
              </div>            
            </validation-provider>

            <validation-provider rules="required" v-slot="{errors, classes}">
              <div class="form-group">
                <!-- 輸入框 -->
                <label for="usertel">Phone</label>
                <input id="usertel" type="text" name="phone" v-model="form.user.tel"
                    class="form-control" :class="classes">
                <!-- 錯誤訊息 以下為slot-->
                <span class="invalid-feedback">{{errors[0]}}</span>
              </div>            
            </validation-provider>

            <validation-provider rules="required" v-slot="{errors, classes}">
              <div class="form-group">
                <!-- 輸入框 -->
                <label for="useraddress">Address</label>
                <input id="useraddress" type="text" name="address" v-model="form.user.address"
                    class="form-control" :class="classes">
                <!-- 錯誤訊息 以下為slot-->
                <span class="invalid-feedback">{{errors[0]}}</span>
              </div>            
            </validation-provider>

            <validation-provider v-slot="{errors, classes}">
              <div class="form-group">
                <!-- 輸入框 -->
                <label for="comment">Message</label>
                <textarea id="comment" name="usermessage" class="form-control" :class="classes" cols="30" rows="10" v-model="form.message"></textarea>
                <!-- 錯誤訊息 以下為slot-->
                <span class="invalid-feedback">{{errors[0]}}</span>
              </div>            
            </validation-provider>


            <!-- 送出表單使用 submit 的方法，如果驗證未通過則 disabled 該按鈕 -->
            <button type="submit" class="btn btn-danger" :disabled="invalid">Submit</button>
          </form>
        </validation-observer>      
    </div>
    


    <!-- Form -->
    <!-- <div class="my-5 row justify-content-center">
      <form class="col-md-6" @submit.prevent="sendOrder">
        <div class="form-group">
          <label for="exampleInputEmail1">Email</label>
          <input
            type="email"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            placeholder="Please Enter email"
          />
          <small id="emailHelp" class="form-text text-muted"
            >We'll never share your email with anyone else.</small
          >
        </div>
      </form>
    </div> -->
  </div>
</template>



<script>
import $ from "jquery"; // 如果不在這邊注入jquery的話，第4行的button會出現: '$' is undefined
import Pagination from "../pagination";

export default {
  data() {
    return {
      products: [],
      product: {},
      isLoading: false,
      status: {
        loadingItem: "",
      },
      carts: [],
      pagination: {}, // 下面的getProducts()會存放pagination相關的資料到這邊
      coupon_code:'',
      form:{
        user:{
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      }
    };
  },
  methods: {
    getProducts(page = 1) {
      // (page = 1)是ES6的寫法，只要是沒有傳入page，就會自動帶入1。
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/products?page=${page}`;
      const vm = this;
      vm.isLoading = true;
      this.$http.get(api).then((response) => {
        console.log("getProducts(): ", response.data);
        vm.isLoading = false;
        vm.products = response.data.products; //用console.log來確認是否成功getProducts();
        vm.pagination = response.data.pagination; //將變數存進vm.pagination裡面
      });
    },
    getProduct(id) {
      // 個別單獨的product
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/product/${id}`;
      const vm = this;
      vm.status.loadingItem = id;
      this.$http.get(api).then((response) => {
        console.log("getProduct(): ", response.data);
        vm.isLoading = false;
        vm.product = response.data.product; //用console.log來確認是否成功getProducts();
        $(`#productModal`).modal("show");
        vm.status.loadingItem = "";
      });
    },
    addToCart(id, qty = 1) {
      // 後面給值的話就是預設值
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart`;
      const vm = this;
      vm.status.loadingItem = id;
      const cart = {
        product_id: id,
        qty: qty,
      };
      console.log("cart", cart);
      this.$http.post(api, { data: cart }).then((response) => {
        console.log("addToCart(): ", response.data);
        vm.isLoading = false;
        vm.status.loadingItem = "";
        vm.getCart();
        $("#productModal").modal("hide");
      });
    },
    getCart() {
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart`;
      const vm = this;
      this.$http.get(api).then((response) => {
        console.log("getCart(): ", response.data);
        vm.isLoading = false;
        vm.carts = response.data.data;
        console.log("carts", vm.carts);
      });
    },
    removeCartItem(id) {
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart/${id}`;
      const vm = this;
      vm.isLoading = true;
      this.$http.delete(api).then((response) => {
        console.log("removeCartItem(): ", response.data);
        vm.getCart();
        vm.isLoading = false;
      });
    },
    addCouponCode() {
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/coupon`;
      const vm = this;      
      const coupon = {
        code: vm.coupon_code
      }
      vm.isLoading = true;
      this.$http.post(api, {data: coupon}).then((response) => {
        console.log("addCouponCode(): ", response.data);
        vm.getCart();
        vm.isLoading = false;
      });
    },
    createOrder() {
      const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/order`;
      const vm = this;      
      const order = vm.form;
          this.$http.post(api, {data: order}).then((response) =>{
            console.log('Your order is established', response);
            if(response.data.success){
              vm.$router.push(`/customer_checkout/${response.data.orderId}`);
              console.log('router完成');
            }
          }) 
        },
  },
  created() {
    const token = document.cookie.replace(
      // 助教發現沒有post出去竟然沒有token
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    if (token !== "") {
      this.axios.defaults.headers.common["Authorization"] = token;
      this.getProducts(); // 不要忘記寫created，不然會無法觸發!
      this.getCart();
    }
  },
};
</script>