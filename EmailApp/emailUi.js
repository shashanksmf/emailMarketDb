$( document ).ready(function() {
  $('.emailbtn').unbind().click(function () {
    console.log('click');
    var emailList = $('#exampleFormControlTextarea1').val();
    emailList=emailList.split('\n')
    // emailList=JSON.stringify(emailList)
    console.log("emailList==>",emailList);
    // str = str.replace(/,/gi, "\n").replace(/^,/,"");

    // emailList.toString().replace(,'');
    function transactionDetails(emailList) {
      var data = {emailList: emailList};
      $.ajax({
        url:"/getEmail",
        type:"post",
        data: data,
        success:function (successData) {
          console.log(successData);
          $('#emailunmatchdata').html('');
          var htmlStr ="";
          // console.log(successData);
          var data =successData.data.unmatcharr;
         console.log("data==>",data);
          data.forEach(unmatchdata =>{
            htmlStr += unmatchdata + '\n';
            // '<tr>'+
            // '<td>'+unmatchdata+'</td>'+
            // '</tr>';
          });
          $('#emailunmatchdata').html(htmlStr);

          renderTable(successData);
        },
        error: function(err) {
          console.log("err=>", err);
        }
      });

    }
    transactionDetails(emailList);
  })
  function renderTable(successData) {
    $('#emaildata').html('');
    var htmlStr ="";
    console.log(successData);
    var data =successData.data.matcharr;
    data.forEach(email=>{
      htmlStr +='<tr>'+
      '<td>'+email["_id"]+'</td>'+
      '<td>'+email["email"]+'</td>'+
      '<td>'+email["date"]+'</td>'+
      '</tr>';
    });
    $('#emaildata').append(htmlStr);

  }

});
