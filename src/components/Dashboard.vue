<template>
    <div>
        <Navbar/>
        <Alert/>
        <div class="container-fluid">
        <div class="row">
            <Sidebar/>
            <main role="main" class="col-md-12 ml-sm-auto col-lg-10 px-4">
                <router-view></router-view> <!-- 在App.Vue裡面也有<router-view>，所以目前是巢狀 -->
            </main>
        </div>
        </div>
    </div>
</template>



<script>
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Alert from './AlertMessage';

export default {
    components:{
        Sidebar,
        Navbar,
        Alert,
    }    
};
</script>
