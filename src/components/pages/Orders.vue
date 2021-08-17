<template>
    <div>
        <loading :active.sync="isLoading" ></loading>
        <table class="table mt-4">
            <thead>
                <tr>
                <th>購買時間</th>
                <th>Email</th>
                <th>購買款項</th>
                <th>應付金額</th>
                <th>是否付款</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item) in orders" :key="item.id">
                    <td>{{item.paid_date}}</td>
                    <td>{{item.user.email}}</td>
                    <td>
                        <ul class="list-unstyled">
                            <li v-for="(product, i) in item.products" :key="i">
                                {{ product.product.title }} 數量：{{ product.qty }}
                                {{ product.product.unit }}
                            </li>
                        </ul>
                    </td>
                    <td class="text-right">{{item.total | currency}}</td>
                    <td>
                        <span v-if="item.is_paid" class="text-success">Paid</span>
                        <span v-if="item.is_paid !== true" class="text-danger">None paid</span>
                    </td>      
                    <!-- <td>
                        <button class="btn btn-outline-primary btn-sm" @click="openModal(false, item)">編輯</button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteModal(item)">刪除</button>
                    </td>               -->
                </tr>
            </tbody>
        </table>
        <!-- Pagination -->
        <Pagination :pagination="pagination" @emitPage="getOrders"></Pagination>
    </div>
</template>

<script>
import $ from 'jquery'; // 如果不在這邊注入jquery的話，第4行的button會出現: '$' is undefined
import Pagination from "../pagination"

export default {
    components:{
        Pagination,
    },
    data() {
        return{
            orders:{},
            isNew: false,
            isLoading: false,
            pagination:{}, // 下面的getOrders()會存放pagination相關的資料到這邊
        } 
    },
    methods: {
        getOrders(page = 1){ // (page = 1)是ES6的寫法，只要是沒有傳入page，就會自動帶入1。
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/orders?page=${page}`;
            const vm = this;
            vm.isLoading = true;
            this.$http.get(api).then((response) => {
            console.log('response.data', response.data);
            vm.isLoading = false;
            vm.orders = response.data.orders; //用console.log來確認是否成功getOrders();
            vm.pagination = response.data.pagination; //將變數存進vm.pagination裡面
            });
        },
    },
    created(){
        const token = document.cookie.replace( // 助教發現沒有post出去竟然沒有token
        /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
        "$1"
        );
        if (token !== "") {
            this.axios.defaults.headers.common["Authorization"] = token;   
            this.getOrders(); // 不要忘記寫created，不然會無法觸發!
        }
    },

}
</script>